const passport = require('passport'),
      express = require('express'),
      router = express.Router();

const Organization = require('../models/organization'),
      Mission = require('../models/mission'),
      accessControl = require('../helpers/accessControl');

module.exports = {
  showCreateOrg(req, res) {
    const ViewModel = {
      user: req.user
    };
    res.render('createOrganization', ViewModel);
  },
  createOrg(req, res) {
    if (accessControl.onlyAdmin(req)) {
      const ViewModel = {
        user: req.user
      };
      if (req.body.orgName) {
        Organization.findOne({name: {$regex: req.body.orgName}},
          (err, organization) => {
            if (err) {
              console.log('Error on Organization.findOne query');
              console.log(err);
            }
            if (!organization) {
              var newOrganization = new Organization({
                name: req.body.orgName,
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                zipcode: req.body.zipcode,
                contactName: req.body.contactName,
                contactEmail: req.body.contactEmail,
                url: req.body.url
              });
              newOrganization.save((err, organization) => {
                res.redirect('/organizationList');
                console.log('Organization created');
              });
            } else {
              ViewModel.error = 'Organization with that name already exists!';
              res.render('createOrganization', ViewModel);
            }
          }
        )
      } else {
        ViewModel.error = 'Organization name is a required field';
        res.render('createOrganization', ViewModel);
      }
    } else {
      res.redirect('/login');
    }
  },
  organizationList(req, res) {
    const ViewModel = {
      user: req.user,
      organizations: [],
      selectedOrg: 0
    };
    if (req.body.orgList) {
      ViewModel.selectedOrg = req.body.orgList.value;
    }
    Organization.find({}, {}, {sort: {name: 1}}, (err, organizations) => {
      if (err) {throw err};
      for (i = 0; i < organizations.length; i++) {
        ViewModel.organizations[i] = {
          name: organizations[i].name,
          address1: organizations[i].address1,
          address2: organizations[i].address2,
          city: organizations[i].city,
          state: organizations[i].state,
          zipcode: organizations[i].zipcode,
          contactName: organizations[i].contactName,
          contactEmail: organizations[i].contactEmail,
          url: organizations[i].url,
          isSelected: (i==ViewModel.selectedOrg)
        };
      }
      console.log(ViewModel);
      ViewModel.detailOrg = organizations[ViewModel.selectedOrg];
      res.render('listOrganizations', ViewModel);
    });
  }
}
