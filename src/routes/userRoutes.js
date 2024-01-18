import express from 'express';
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middlewares.js';

const userRouter = express.Router();

// Public Routes 
userRouter.post('/register', UserController.userRegister);
userRouter.post('/login', UserController.userLogin);
userRouter.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail);
userRouter.post('/reset-password/:id/:token', UserController.userPasswordReset);

// Protected Routes - Requires token validation middleware
userRouter.post('/changeUserPassword', checkUserAuth, UserController.changeUserPassword);
userRouter.get('/loggedUser', checkUserAuth, UserController.loggedUser);


export default userRouter;