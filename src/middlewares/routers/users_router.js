const UserController = require('../../controllers/user_controller.js');
const UserResponseBuilder = require('../response_builders/user_response_builder.js');

function UsersRouter(app, logger, postgrePool) {
  let _userController = new UserController(logger, postgrePool);
  let _userResponseBuilder = new UserResponseBuilder(logger);

  app.get('/api/user',
    _userController.findUser,
    _userResponseBuilder.buildResponse
  );
}


module.exports = UsersRouter;
