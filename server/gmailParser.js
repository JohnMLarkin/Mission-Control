/******************************************************************************
  Support for parsing a "full" Gmail message

  History and Credits:
    v. 1.0.0:
      - Begin with Emil Tholin's gmail-api-parse-message (v. 2.0.0)
        (https://github.com/EmilTholin/gmail-api-parse-message)
      - Change base64 decode references to use Node internal version
      - Adapt portion of Steve Lacey's parse-gmail-email (v. 1.1.1) to
        restrict top-level header section to most important headers and do
        further parsing (e.g., splitting "to" into name and email)
        (https://github.com/stevelacy/parse-gmail-email)

******************************************************************************/

'use strict';

// Import Node packages
const addressparser = require('addressparser');

/**
 * Decodes a url safe Base64 string to its original representation.
 * @param  {string} string
 * @return {string}
 */
function urlB64Decode(string) {
  return string
   ? decodeURIComponent(escape(Buffer.from(string.replace(/\-/g, '+').replace(/\_/g, '/'),'base64').toString('utf8')))
   : '';
}

/**
 * Takes a header array filled with objects and transforms it into a more
 * pleasant key-value object (dictionary).
 * @param  {array} headers
 * @return {object}
 */
function indexHeaders(headers) {
  if (!headers) {
    return {};
  } else {
    return headers.reduce(function (result, header) {
      result[header.name.toLowerCase()] = header.value;
      return result;
    }, {});
  }
}

/**
 * Takes a dictionary for top-level headers and extracts only high priority
 * keys (to, from, subject, and cc). Email-type fields are further processed
 * into separate "name" and "address" key-value pairs.
 * @param {object} headers
 * @param {object}
 */
function prettifyTopHeaders(headers) {
  var prettyHeaders = {};
  prettyHeaders.other = {};
  for (var hk in headers) {
    switch (hk) {
      case 'to':
        prettyHeaders.to = parseEmailHeader(headers[hk]);
        break;
      case 'from':
        prettyHeaders.from = parseEmailHeader(headers[hk]);
        break;
      case 'cc':
        prettyHeaders.cc = parseEmailHeader(headers[hk]);
        break;
      case 'bcc':
        prettyHeaders.bcc = parseEmailHeader(headers[hk]);
        break;
      case 'subject':
        prettyHeaders.subject = headers[hk];
        break;
      case 'date':
        prettyHeaders.date = headers[hk];
      default:
        prettyHeaders.other[hk] = headers[hk];
    }
  }
  return prettyHeaders;
}

/**
 * Parse email-type header field into separate "name" and "address" key-value
 * pair.
 * @param {object} header
 * @param {object}
 */
 function parseEmailHeader(header) {
   var subDict;
   var parsedForm = addressparser(header);
   // Is this a single address or multiple addresses?
   if (parsedForm.length>1) {
     subDict = [];
     for (var i = 0; i < parsedForm.length; i++) {
       subDict[i] = {
         name: parsedForm[i].name || '',
         address: parsedForm[i].address.toLowerCase()
       };
       if ((subDict[i].name === '') || (subDict[i].name === ' ')) {
         subDict[i].name = subDict[i].address;
       }
     }
   } else {
     subDict = {
       name: parsedForm[0].name,
       address: parsedForm[0].address.toLowerCase()
     };
     if ((subDict.name === '') || (subDict.name === ' ')) {
       subDict.name = subDict.address;
     }
   }
   return subDict;
 }

 /**
 * Takes a data object from the Gmail API's GET method using "full"
 * option and extracts all the relevant data.  If includeAllHeaders
 * is true then returned object includes all headers (most in "otherHeaders").
 * Default is false.
 * @param  {object} data
 * @param  {boolean} includeAllHeaders
 * @return {object}
 */
 module.exports = function gmailParser(data, includeAllHeaders) {
   if (!includeAllHeaders) includeAllHeaders = false;
   var result = {
     id: data.id,
     threadId: data.threadId,
     labelIds: data.labelIds,
     snippet: data.snippet,
     historyId: data.historyId
   };
   if (data.internalDate) {
     result.internalDate = parseInt(data.internalDate);
   }

   var payload = data.payload;
   if (!payload) {
     return result;
   }

   var headers = indexHeaders(payload.headers);
   var prettyHeaders = prettifyTopHeaders(headers);

   if (prettyHeaders.to) result.to = prettyHeaders.to;
   if (prettyHeaders.from) result.from = prettyHeaders.from;
   if (prettyHeaders.cc) result.cc = prettyHeaders.cc;
   if (prettyHeaders.bcc) result.bcc = prettyHeaders.bcc;
   if (prettyHeaders.subject) result.subject = prettyHeaders.subject;
   if (prettyHeaders.date) result.date = prettyHeaders.date;
   if (includeAllHeaders) result.otherHeaders = prettyHeaders.other;

   var parts = [payload];
   var firstPartProcessed = false;

   while (parts.length !== 0) {
     var part = parts.shift();
     if (part.parts) {
       parts = parts.concat(part.parts);
     }
     if (firstPartProcessed) {
       headers = indexHeaders(part.headers);
     }

     var isHtml = part.mimeType && part.mimeType.indexOf('text/html') !== -1;
     var isPlain = part.mimeType && part.mimeType.indexOf('text/plain') !== -1;
     var isAttachment = headers['content-disposition'] && headers['content-disposition'].indexOf('attachment') !== -1;

     if (isHtml && !isAttachment) {
       result.textHtml = urlB64Decode(part.body.data);
     } else if (isPlain && !isAttachment) {
       result.textPlain = urlB64Decode(part.body.data);
     } else if (isAttachment) {
       var body = part.body;
       if(!result.attachments) {
         result.attachments = [];
       }
       result.attachments.push({
         filename: part.filename,
         mimeType: part.mimeType,
         size: body.size,
         attachmentId: body.attachmentId
       });
     }

     firstPartProcessed = true;
   }

   return result;
 };
