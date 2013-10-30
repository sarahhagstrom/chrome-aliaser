Aliaser is a Chrome extension that provides multiple-parameter URL aliasing.

Currently in Chrome, you can create single-parameter aliases by customizing your Search Engines in settings. However, you can only use one <b>%s</b> parameter.

This extension provides similar functionality but with multiple <b>%s</b> parameters allowed in the URL. You can also use it for your single- and no-parameter aliases, of course

![Aliaser screenshot](https://raw.github.com/sarahhagstrom/chrome-aliaser/master/docs/img/Aliaser.png)

## How to use this extension

Enter new aliases into the Aliaser extension popup, using <b>%s</b> to denote parameters.

Once you've entered an alias into the extension popup, you can invoke it by entering <b><i>a</i></b> followed by a space into the address bar to summon the extension omnibox, then type the alias followed by any parameter values it expects to see.

For example, to invoke the <b>spanishfor</b> alias in the above screenshot to find out what the spanish translation of "good job, you!" is, just type

`a spanishfor good job, you!`

## Multiple parameters

Of course, while this extension provides a handy toolbar popup reference for your aliases, if you define this as a custom search engine in Chrome instead, you can do away with the extra two keystrokes (<b>a</b> followed by <b>space</b>) at the beginning of this command.

The service this extension really provides over Chrome's custom search engines is that it allows you to use multiple <b>%s</b> parameters in a URL.

So for example, using the <b>bikes</b> alias in the above screenshot, the following command will take you to all Univega bikes posted for sale in Seattle's Craigslist for $200 to $600:

`a bikes seattle univega 200 600`

## A few particulars

<i>If more tokens are entered for an alias than it expects, all tokens will be lumped together and applied to the final parameter.</i>

So for example, `a a 3 wolves howling at the moon`<br>
will take you to `http://www.amazon.com/s/?field-keywords=3%20wolves%20howling%20at%20the%20moon` without complaint

<i>To send a spaced-out token to a middling parameter, use quotes.</i>

So `a map "1443 Alabama St SF" bike 10`<br>
will take you to `https://maps.google.com/maps?q=1443%20Alabama%20St%20SF&lci=bike&z=10`<br>

<i>If you supply fewer tokens than a parameterized URL expects, the aliaser will attempt to recover the situation by simply leaving off those parameters if they are not part of the subdomain portion of the URL.</i>

So `a map "1443 Alabama St SF" bike`<br>
will take you to `https://maps.google.com/maps?q=1443%20Alabama%20St$20SF&lci=bike`<br>

And `a you`<br>
will take you to `http://www.youtube.com`<br>

But if you enter `a bikes`, there is nothing to be done, so nothing will be done.

## A blog post

I've written up a blog post about this extension <a href="http://www.sarahhagstrom.com/2013/10/multiple-parameter-url-alias-extension-for-chrome/" target="_blank">here</a>