# cordova-travis
Displays travis information about cordova repos. Very simple to use:
```
npm i -g cordova-travis
cordova-travis
```

If you hit API rate limit you can easily set one.

To set your GitHub Api key goto:
https://github.com/settings/applications

Once created a Personal Access Token, set the environment value:
```
set ghkey=123123213123123213123
echo %ghkey%
```

Output will look something like this:
![sampleimg](http://i.imgur.com/mbXDuHy.png)
