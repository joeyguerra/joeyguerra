#!/bin/bash

rm -f response
mkfifo response

function handleRequest(){
    while read line; do
        echo $line
        trline=`echo $line | tr -d '[\r\n]'`
        [ -z "$trline" ] && break

        HEADLINE_REGEX='(.*?)\s(.*?)\sHTTP.*?'
        [[ "$trline" =~ $HEADLINE_REGEX ]] &&
            REQUEST=$(echo $trline | sed -E "s/$HEADLINE_REGEX/\1 \2/")
    done
    echo "request = $REQUEST"
    case "$REQUEST" in
        "GET /login") RESPONSE=$(cat login.html) ;;
                   *) RESPONSE=$(cat 404.html) ;;
    esac
    echo -e "$RESPONSE" > response
}
echo 'Listening on 3000.'
while true; do
    cat response | nc -l 3000 | handleRequest
done