export default () => {
    return async (req, res) => {
        if (!req.session) {
            req.session = {}
        }
    }
}