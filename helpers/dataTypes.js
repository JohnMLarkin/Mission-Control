const dataTypes = {
  uint8: {size: 1, converter:'readUInt8'},
  int8: {size: 1, converter: 'readInt8'},
  uint16: {size: 2, converter: 'readUInt16LE'},
  int16: {size: 2, converter: 'readInt16LE'},
  uint32: {size: 4, converter: 'readUInt32LE'},
  int32: {size: 4, converter: 'readInt32LE'},
  float: {size: 4, converter: 'readFloatLE'},
  double: {size: 8, converter: 'readDoubleLE'}
};

module.exports = dataTypes;
