module.exports = function getExt(header){
  if(header.indexOf('jpeg') > -1 || header.indexOf('jpg') > -1 ) return '.jpg';
  if(header.indexOf('png') > -1 ) return '.png';
  return '';
}