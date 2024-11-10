export default () => {
    return async (req, res) => {
        if(!req.session) {
            throw new Error('FlashMessage middleware requires session middleware')
        }
        req.session.flash = []
        req.flash = res.flash = (type, message)=>{
            req.session.flash.push({type, message})
        } 
    }
}