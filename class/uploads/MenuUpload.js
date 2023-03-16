const Upload = require("../Upload");
const path = require('path')

class MenuUpload extends Upload
{
          constructor() {
                    super()
                    this.destinationPath = path.resolve('./') + path.sep + 'public' + path.sep + 'uploads' + path.sep + 'menu'
          }
}
module.exports = MenuUpload