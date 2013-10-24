Aliaser is a Chrome extension that brings the little-known FireFox parameterized URL aliasing functionality to Chrome, but it's even better because it allows multiple parameters, while the FireFox aliases only allow one.

![Aliaser screenshot](https://raw.github.com/sarahhagstrom/chrome-aliaser/master/docs/img/Aliaser.png)

Enter new aliases into the Aliaser extension popup, using '%s' to denote parameters.

Once you've entered an alias into the extension popup, you can invoke it by entering 'a' followed by a space into the address bar to summon the extension omnibox, then type the alias followed by parameter values. For example to invoke the 'cl' alias in the above screenshot, subbing '%s' with 'seattle' type this:

`a cl seattle`

(Yes the additional two keystrokes required to invoke the omnibox is annoying, but as far as I know, there's no way around this, as this is now Chrome extensions work. If you know otherwise, please do let me know.)

## The particulars

<b>If more tokens are entered for a URL than the number of expected parameters, all tokens will be lumped together and applied to the final parameter.</b>

So for example:

`a m 1443 Alabama St SF`<br>
will take you to<br>
`https://maps.google.com/maps?q=1443%20Alabama%20St%20SF` without complaint

<b>To send a be-spaced token to a middling parameter, use quotes.</b>

So `a map "1443 Alabama St SF" bike 10`<br>
will take you to<br>
`https://maps.google.com/maps?q=1443%20Alabama%20St%20SF&lci=bike&z=10`<br>

<b>If you supply fewer tokens than a parameterized URL expects, the aliaser will attempt to recover the situation by simply leaving off those parameters if they are not part of the subdomain portion of the URL.</b>

So `a map "1443 Alabama St SF" bike`<br>
will take you to<br>
`https://maps.google.com/maps?q=1443%20Alabama%20St$20SF&lci=bike`<br>

And `a you`<br>
will take you to<br>
`http://www.youtube.com`<br>

And `a pint kittens`<br>
will take you to<br>
`http://www.pinterest.com/kittens/`<br>

But if you enter `a cl`, there is nothing to be done, so nothing will be done.
