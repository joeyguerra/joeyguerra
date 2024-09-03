// Description:
//   Add authorized roles to hubot.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//   You can check for this to protect your scripts.
//
// Author:
//   Joey Guerra


export default robot => {
    robot.authorizedRoles = [
        'Kaizen-Core',
        'Admin'
    ]
}