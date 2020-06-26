require('mocha/mocha')

mocha.setup('bdd')
require('./example')
mocha.run()
