import todo from "./todo.mjs"
(async function(){
    await todo.run()
    process.exit(todo.failed.length > 0 ? 1 : 0)
})()
