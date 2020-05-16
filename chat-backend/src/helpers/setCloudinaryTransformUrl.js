module.exports = (url, width) => {
  if (url) {
    let urlParts = url.split('/');
    urlParts.splice(-1, 0, `w_${width}`);
    const transformedUrl = urlParts.join('/');

    return transformedUrl; 
  }
};