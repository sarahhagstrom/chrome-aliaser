Aliaser is a Chrome extension that provides multiple-parameter URL aliasing.

Currently in Chrome, you can create single-parameter aliases by customizing your Search Engines in settings. However, you can only use one <b>%s</b> parameter.

This extension provides similar functionality but with multiple <b>%s</b> parameters allowed in the URL. You can also use it for your single- and no-parameter aliases, of course

![Aliaser screenshot](https://raw.github.com/sarahhagstrom/chrome-aliaser/master/docs/img/Aliaser.png)

## How to use this extension

Enter new aliases into the Aliaser extension popup, using <b>%s</b> to denote parameters.

Once you've entered an alias into the extension popup, you can invoke it by entering <b><i>a</i></b> followed by a space into the address bar to summon the extension omnibox, then type the alias followed by any parameter values it expects to see.

For example, to invoke the 'cl' alias in the above screenshot, subbing <b>%s</b> with <b>seattle</b> (i.e. to go to http://seattle.craigslist.org), type this:

`a cl seattle`

Or to find out what the spanish translation of "good job, you!" is, just type

`a spanishfor good job, you!`

Neato!

(Yes the additional two keystrokes required to invoke the omnibox are annoying, but as far as I know, there's no way around this, as this is how Chrome extensions work. If you know otherwise, please do let me know.)

## A few particulars

<i>If more tokens are entered for an alias than it expects, all tokens will be lumped together and applied to the final parameter.</i>

So for example, `a m 1443 Alabama St SF`<br>
will take you to `https://maps.google.com/maps?q=1443%20Alabama%20St%20SF` without complaint

<i>To send a be-spaced token to a middling parameter, use quotes.</i>

So `a map "1443 Alabama St SF" bike 10`<br>
will take you to `https://maps.google.com/maps?q=1443%20Alabama%20St%20SF&lci=bike&z=10`<br>

<i>If you supply fewer tokens than a parameterized URL expects, the aliaser will attempt to recover the situation by simply leaving off those parameters if they are not part of the subdomain portion of the URL.</i>

So `a map "1443 Alabama St SF" bike`<br>
will take you to `https://maps.google.com/maps?q=1443%20Alabama%20St$20SF&lci=bike`<br>

And `a you`<br>
will take you to `http://www.youtube.com`<br>

And `a pint kittens`<br>
will take you to `http://www.pinterest.com/kittens/`<br>

But if you enter `a cl`, there is nothing to be done, so nothing will be done.
