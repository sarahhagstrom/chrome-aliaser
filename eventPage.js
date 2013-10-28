var chromeAliaser = chromeAliaser || {};

(function (obj) {
    "use strict";
    obj.masterList = {};
    obj.dataFilename = "aliaserData";
    obj.logging = false;

    var getRawData = function () {
            // Retrieve the existing alias list (in string form) from local storage.
            // If it doesn't exist, create it as an empty string
            try {
                var value = window.localStorage.getItem(obj.dataFilename);

                if (!value) {
                    window.localStorage.setItem(obj.dataFilename, "");
                    value = "";
                }
                return value.trim();
            } catch (e) {
                obj.log(e);
                return "";
            }
        },
        setRawData = function (value) {
            // replace the alias list in local storage, then
            // rebuild the master list map that's made from it
            try {
                window.localStorage.setItem(obj.dataFilename, value);
                obj.initMasterList();
            } catch (e) {
                obj.log(e);
            }
        };

    obj.initMasterList = function () {
        // Get the alias list from storage and turn it into a map
        obj.masterList = {};

        var value = getRawData(),
            arr = [],
            i = 0;

        if (value.length === 0) {
            return obj.masterList;
        }

        arr = value.split(/\s+/);

        for (i = 0; i < arr.length; i += 2) {
            obj.masterList[arr[i]] = arr[i + 1];
        }

        return obj.masterList;
    };

    obj.groomURL = function (value) {
        value = value.trim();

        // If no protocol was specified, tack "http://" onto the front
        var regex = /^.+:\/\//;

        if (!regex.test(value)) {
            return "http://" + value;
        }

        return value;
    };

    obj.validateAlias = function (key, value) {
        // Check key exists and contains only alpha-numeric characters
        var regex = /^[a-zA-Z0-9]+$/;
        if (!regex.test(key)) {
            return false;
        }

        // Check value exist and looks like vaguely like a URL
        regex = /^.+:\/\/[^ "]+$/;
        return regex.test(value);
    };

    obj.addAlias = function (key, value) {
        // first, groom and validate
        key = key.trim().substring(0, 20);
        value = obj.groomURL(value);

        if (!obj.validateAlias(key, value)) {
            throw "Invalid alias or URL";
        }

        // delete it if it already exists
        obj.removeAlias(key);

        // then add it back in
        setRawData(getRawData() + " " + key + " " + value);
    };

    obj.removeAlias = function (key) {
        // remove an alias from the list in local storage
        var rawData = getRawData(),
            arr = [],
            foundIndex = -1,
            i = 0;

        if (!rawData || rawData.length === 0) {
            return;
        }

        // convert the raw data to an array
        arr = rawData.split(/\s+/);

        // find the index of the key we want to delete
        for (i = 0; i < arr.length; i += 2) {
            if (key === arr[i]) {
                foundIndex = i;
                break;
            }
        }

        // delete both the key and the value
        if (foundIndex >= 0) {
            arr.splice(foundIndex, 2);
        }

        // rejoin array and store
        setRawData(arr.join(" "));
    };

    obj.tokenize = function (text) {
        // take what the user has entered in the omnibox and make
        // some sense of it.

        // replace multiple spaces with single spaces
        text = text.trim().replace(/\s+/g, " ");
        // remove spaces around quotes
        text = text.replace(/\s*"\s*/g, '"');

        var params = [],
            start = 0,
            index = text.indexOf('"'),
            p;

        while (index !== -1 && index < text.length - 1) {
            // if there were params before the quoted parameter
            if (start !== index) {
                // split anything before the first quote up by spaces
                params.push.apply(params, text.substring(start, index).trim().split(/\s+/));
            }

            // look for next quote
            start = index + 1; // starting with the char after the first quote
            index = text.indexOf('"', start);
            if (index === -1) {
                // end quote was omitted, assign as end of the string
                index = text.length;
            }

            // add the quoted string
            params.push(text.substring(start, index));

            start = index + 1; // starting with the char after the end quote
            index = text.indexOf('"', start);
        }

        if (index === -1 && start < text.length) {
            // chop up rest of string by spaces
            params.push.apply(params, text.substring(start).split(/\s+/));
        }

        // URL encode all params
        for (p in params) {
            if (params.hasOwnProperty(p)) {
                params[p] = encodeURIComponent(params[p]);
            }
        }

        return params;
    };

    obj.assembleURL = function (tokens) {
        var aliasTerm, aliasValue, paramSplit, numParams, nonParamedURL, i, slashSplit;

        if (tokens.length > 0) {
            aliasTerm = tokens[0];

            // look up alias in our master list
            if (chromeAliaser.masterList.hasOwnProperty(aliasTerm)) {
                aliasValue = chromeAliaser.masterList[aliasTerm];
                // look for '%s' in our alias value to determine
                // if this alias expects parameters
                paramSplit = aliasValue.split("%s");
                numParams = paramSplit.length;

                if (numParams > 1) {
                    // We have parameters. Populate them.

                    // get rid of the aliasTerm token,
                    // leaving us just the param values the user entered
                    tokens.shift();

                    // get rid of the empty last paramSplit item, which will be there
                    // if "%s" occurs at the end of aliasValue
                    if (paramSplit[numParams - 1].length === 0) {
                        paramSplit.pop();
                    }

                    if (tokens.length > 0) {
                        var result = [];

                        // given list entry: map-> http://maps.google.com/maps?z=%s&lic=%s&q=%s
                        // and omni entry: map 17 bike 2908 Bryant Ave S Minneapolis MN
                        // tokens now has: [17,bike,2908,Bryant,Ave,S,Minneapolis,MN]
                        // paramSplit now has: [http://maps.google.com/maps?z=,lic=,q=]
                        for (i = 0; i < paramSplit.length && i < tokens.length; i++) {
                            result.push(paramSplit[i]);
                            result.push(tokens[i]);
                        }

                        if (i >= tokens.length && i < paramSplit.length) {
                            // we're out of tokens, but the alias value goes on.
                            // if the next segment of the alias value
                            // ends with "=", ignore it and all remaining
                            // segments.
                            // otherwise, append the next segment, but stop
                            // there.
                            // this allows http://%s.craigslist.org
                            // to work while also allowing a user to use
                            // a smaller set of parameters on a url like
                            // http://maps.google.com/map?q=%s&lci=%s&z=%s
                            if (paramSplit[i][paramSplit[i].length - 1] !== "=") {
                                result.push(paramSplit[i]);
                            }
                        } else {
                            // If we have more tokens than parameters, the rest are
                            // considered part of the last parameter.
                            while (i < tokens.length) {
                                result.push("%20" + tokens[i]);
                                i++;
                            }
                        }

                        aliasValue = result.join("");
                    } else {
                        // If the user entered no tokens for a parameterized
                        // alias value, attempt to recover by navigating
                        // to the non-parameterized URL, as long as there
                        // are no '%s' params before the URL params
                        nonParamedURL = aliasValue.split("?")[0];

                        if (nonParamedURL.indexOf("%s") === -1) {
                            aliasValue = nonParamedURL;
                        } else {
                            // We still might succeed by truncating
                            // the URL even more, to the first '/'
                            // after the protocol
                            slashSplit = aliasValue.split("/");

                            if (slashSplit.length > 2) {
                                nonParamedURL = slashSplit.splice(0, 3).join("/");
                            }

                            if (nonParamedURL.indexOf("%s") === -1) {
                                aliasValue = nonParamedURL;
                            } else {
                                // otherwise we're left with no choice
                                // but to ignore the request because
                                // the user is not making any sense.
                                // This URL looks something like
                                // http://%s.craigslist.org, so it
                                // really does need a token.
                                aliasValue = "";
                            }
                        }
                    }
                }

                return aliasValue;

            }

            obj.log("alias not found: " + aliasTerm);
            obj.log("master list: " + getRawData());
        }

        return "";
    };

    obj.go = function (text, tab) {
        // tokenize the input
        var tokens = obj.tokenize(text),
            goToURL = obj.assembleURL(tokens);

        if (goToURL.length > 0) {
            chrome.tabs.update(tab.id, {url: goToURL});
        }
    };

    obj.log = function (message) {
        if (obj.logging) {
            window.console.log(message);
        }
    };
}(chromeAliaser));

chromeAliaser.initMasterList();

chrome.omnibox.onInputEntered.addListener(function (text) {
    "use strict";
    chrome.windows.getCurrent(function (window) {
        chrome.tabs.getSelected(window.id, function (tab) {
            chromeAliaser.go(text, tab);
        });
    });
});
