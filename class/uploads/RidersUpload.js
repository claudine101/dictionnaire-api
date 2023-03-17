const Upload = require("../Upload");
const path = require('path')

class RidersUpload extends Upload
{
          constructor() {
                    super()
                    this.destinationPath = path.resolve('./') + path.sep + 'public' + path.sep + 'uploads' + path.sep + 'riders'
          }
}
module.exports = RidersUpload