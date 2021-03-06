var request = require('request'),
  config = require('../../config');


exports.getSyncInfo = function (callback) {
  try {
    request.get(config.webdollar.pouchdb_sync_url + '/blocks/' + 1, function (error, response, body) {
      if (error) {
        console.error(error)
        console.error(body)
        callback()
        return
      } else {
        try {
          var raw_blocks = JSON.parse(body).blocks
          callback(raw_blocks[0])
          return
        } catch (e) {
          console.log(e)
          callback()
          return
        }
      }
    });
  } catch (e) {
    console.log(e)
    callback()
  }
}

