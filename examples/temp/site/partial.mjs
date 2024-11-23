<!DOCTYPE html>
<html>
<head>
    <title>Layout</title>
</head>
<body>
    export default {
    layout: 'layout.html',
    match(url) {
        return url === '/partial.html'
    }
}
</body>
</html>
