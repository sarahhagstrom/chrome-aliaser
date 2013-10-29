// set dataFilename to a test file name
chromeAliaser.dataFilename = "testData";

function getRawData() {
    var value = window.localStorage.getItem(chromeAliaser.dataFilename);

    if (!value) {
        window.localStorage.setItem(chromeAliaser.dataFilename, "");
        value = "";
    }
    return value.trim();
}

function setRawData(value) {
    // replace the alias list in local storage, then
    // rebuild the master list map that's made from it
    window.localStorage.setItem(chromeAliaser.dataFilename, value);
}

describe("AliaserList", function() {
	it("Data file is empty to start with", function() {
		setRawData("");
		expect(getRawData()).toEqual("");
	});
	it("Master List is empty to start with", function() {
		expect(chromeAliaser.masterList).toEqual({});
	});
	it("Master List is returned empty from the init function", function() {
		expect(chromeAliaser.initMasterList()).toEqual({});
	});
	it("Data file saves and retrieves properly", function() {
		setRawData("doomy doomy doom");
		expect(getRawData()).toEqual("doomy doomy doom");
		// reset the file back to empty
		setRawData("");
		expect(getRawData()).toEqual("");
    });
	it("Alias is added correctly", function() {
		chromeAliaser.addAlias("doom", "http://www.doom.com");
		expect(getRawData()).toEqual("doom http://www.doom.com");
		expect(chromeAliaser.masterList["doom"]).toEqual("http://www.doom.com");
	});
	it("An alias value without a protocol gets one added to it", function() {
		chromeAliaser.addAlias("tak", "thehideousnewgirl");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl");
		expect(chromeAliaser.masterList["tak"]).toEqual("http://thehideousnewgirl");
	});
	it("An alias with an https:// protocol gets added correctly", function() {
		chromeAliaser.addAlias("map", "https://maps.google.com/map?q=%s&lci=%s");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s");
		expect(chromeAliaser.masterList["map"]).toEqual("https://maps.google.com/map?q=%s&lci=%s");
	});
	it("An alias with a chrome:// protocol gets added correctly", function() {
		chromeAliaser.addAlias("gir", "chrome://tacos");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s gir chrome://tacos");
		expect(chromeAliaser.masterList["gir"]).toEqual("chrome://tacos");
	});
	it("An alias with an ftp:// protocol gets added correctly", function() {
		chromeAliaser.addAlias("ftp", "ftp://sftp");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s gir chrome://tacos ftp ftp://sftp");
		expect(chromeAliaser.masterList["ftp"]).toEqual("ftp://sftp");
	});
	it("An alias with a file:// protocol gets added correctly", function() {
		chromeAliaser.addAlias("file", "file://undercover");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s gir chrome://tacos ftp ftp://sftp file file://undercover");
		expect(chromeAliaser.masterList["file"]).toEqual("file://undercover");
	});
	it("Deletes aliases correctly from data file", function() {
		chromeAliaser.removeAlias("map");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl gir chrome://tacos ftp ftp://sftp file file://undercover");
		expect(chromeAliaser.masterList["map"]).toEqual(undefined);
	});
	it("Replaces duplicates in data file on add", function() {
		chromeAliaser.addAlias("tak", "taknewvalue");
		expect(getRawData()).toEqual("doom http://www.doom.com gir chrome://tacos ftp ftp://sftp file file://undercover tak http://taknewvalue");
		expect(chromeAliaser.masterList["tak"]).toEqual("http://taknewvalue");
	});
	it("Exceptions at requests to add blank alias", function() {
		var testBlankAlias = function() {
		    chromeAliaser.addAlias("", "blankaliastest");
		};
		expect(testBlankAlias).toThrow();
		expect(getRawData()).toEqual("doom http://www.doom.com gir chrome://tacos ftp ftp://sftp file file://undercover tak http://taknewvalue");
	});
	it("Exceptions at requests to add blank alias value", function() {
		var testBlankAliasValue = function() {
		    chromeAliaser.addAlias("blank", "");
		};
		expect(testBlankAliasValue).toThrow();
		expect(getRawData()).toEqual("doom http://www.doom.com gir chrome://tacos ftp ftp://sftp file file://undercover tak http://taknewvalue");
	});
	it("Truncates too-long aliases", function() {
		//reset the dataFile
		setRawData("");
		// submit a 21-character alias
		chromeAliaser.addAlias("thisaliasisalittletoolong", "justalittletoolong");
		expect(getRawData()).toEqual("thisaliasisalittleto http://justalittletoolong");
	});
	it("Exceptions if alias contains non-trailing, non-leading space", function() {
		var testSpaceyAlias = function() {
		    chromeAliaser.addAlias("m ap", "maps.google.com");
		};
		expect(testSpaceyAlias).toThrow();
		expect(getRawData()).toEqual("thisaliasisalittleto http://justalittletoolong");
	});
	it("Exceptions if alias value contains non-trailing, non-leading space", function() {
		var testSpaceyAliasValue = function() {
		    chromeAliaser.addAlias("map", "ma ps.google.com");
		};
		expect(testSpaceyAliasValue).toThrow();
		expect(getRawData()).toEqual("thisaliasisalittleto http://justalittletoolong");
	});
    it("Exceptions if url has quotes in it", function() {
        var testInvalidURL = function() {
            chromeAliaser.addAlias("invalidurl", "urlwith\"quote");
        };
        expect(testInvalidURL).toThrow();
    });
	it("Ignores leading and trailing spaces", function() {
		chromeAliaser.addAlias(" spacey   ", "  somanyspacesforsomereason    ");
		expect(getRawData()).toEqual("thisaliasisalittleto http://justalittletoolong spacey http://somanyspacesforsomereason");
	});
	it("Data file reset successful", function() {
		// reset the dataFile
		setRawData("");
		expect(getRawData()).toEqual("");
	});
});

describe("Tokenize", function() {
	it("Basically works", function() {
		expect(chromeAliaser.tokenize("one two three four"))
		    .toEqual(["one", "two", "three", "four"]);
	});
	it("Can cope with quoted strings at the beginning, middle, and end, alone, and as a group", function() {
		expect(chromeAliaser.tokenize('"one two" three four "five six seven" eight "nine ten eleven"'))
		    .toEqual(["one%20two", "three", "four", "five%20six%20seven", "eight", "nine%20ten%20eleven"]);													      
		expect(chromeAliaser.tokenize('one two "three four" five six'))
		    .toEqual(["one", "two", "three%20four", "five", "six"]);
		expect(chromeAliaser.tokenize('"one two" three four five'))
		    .toEqual(["one%20two", "three", "four", "five"]);
		expect(chromeAliaser.tokenize('one two "three four five"'))
		    .toEqual(["one", "two", "three%20four%20five"]);
		expect(chromeAliaser.tokenize('"one two three four five"'))
		    .toEqual(["one%20two%20three%20four%20five"]);
	});
	it("Can cope with adjacent quoted strings", function() {
		expect(chromeAliaser.tokenize('"one two" "three four" "five six seven" "eight nine"'))
		    .toEqual(["one%20two", "three%20four", "five%20six%20seven", "eight%20nine"]);
	});
	it("Can cope with a missing end quote", function() {
		expect(chromeAliaser.tokenize('"one two" three "four five six'))
		    .toEqual(["one%20two", "three", "four%20five%20six"]);
	});
	it("Can cope with maverick spaces", function() {
		expect(chromeAliaser.tokenize('   "   one two""three four"five        six "seven  eight     " nine   '))
		    .toEqual(["one%20two", "three%20four", "five", "six", "seven%20eight", "nine"]);
	});
});

describe("Assemble URL from tokens", function() {
	// First set the dataFile up with a set of aliases
	it("Setup the data file", function() {
		chromeAliaser.addAlias("cl", "http://%s.craigslist.org/");
		chromeAliaser.addAlias("plainjain", "http://www.sarahhagstrom.com/");
		chromeAliaser.addAlias("map", "https://maps.google.com/maps?q=%s&lci=%s&z=%s");
		chromeAliaser.addAlias("pint", "http://www.pinterest.com/%s/%s/");
		chromeAliaser.addAlias("yt", "http://www.youtube.com/?q=%s");
		expect(chromeAliaser.masterList["cl"]).toEqual("http://%s.craigslist.org/");
		expect(chromeAliaser.masterList["plainjain"]).toEqual("http://www.sarahhagstrom.com/");
		expect(chromeAliaser.masterList["map"]).toEqual("https://maps.google.com/maps?q=%s&lci=%s&z=%s");
		expect(chromeAliaser.masterList["pint"]).toEqual("http://www.pinterest.com/%s/%s/");
		expect(chromeAliaser.masterList["yt"]).toEqual("http://www.youtube.com/?q=%s");
	});
	// Try out some input
	it("Basically works", function() {
		expect(chromeAliaser.assembleURL(["plainjain"]))
		    .toEqual("http://www.sarahhagstrom.com/");
		expect(chromeAliaser.assembleURL(["yt", "kittens"]))
		    .toEqual("http://www.youtube.com/?q=kittens");
		expect(chromeAliaser.assembleURL(["yt", "cute%20overload"]))
		    .toEqual("http://www.youtube.com/?q=cute%20overload");
		expect(chromeAliaser.assembleURL(["pint", "kittens", "puppies"]))
		    .toEqual("http://www.pinterest.com/kittens/puppies/");
	    expect(chromeAliaser.assembleURL(["map", "510%20Larkin%20St%20SF", "bike", "17"]))
		    .toEqual("https://maps.google.com/maps?q=510%20Larkin%20St%20SF&lci=bike&z=17");
	});
	it("Ignores extra tokens on a parameterless alias value", function() {
		expect(chromeAliaser.assembleURL(["plainjain", "one", "two", "three"]))
		    .toEqual("http://www.sarahhagstrom.com/");
	});
	it("Gloms extra tokens into one at the end of a parameterized alias value", function() {
		expect(chromeAliaser.assembleURL(["yt", "one", "two", "three"]))
		    .toEqual("http://www.youtube.com/?q=one%20two%20three");
	});
    it("Doesn't need quotes if there's only one parameter, even if that parameter is in the middle of the URL", function() {
        chromeAliaser.addAlias("bikemap", "https://maps.google.com/maps?q=%s&lci=bike");
        expect(chromeAliaser.masterList["bikemap"]).toEqual("https://maps.google.com/maps?q=%s&lci=bike");
        expect(chromeAliaser.assembleURL(["bikemap", "one", "two", "three"]))
            .toEqual("https://maps.google.com/maps?q=one%20two%20three&lci=bike");
    });
	it("Works when there's a parameter in the middle of the URL", function() {
		expect(chromeAliaser.assembleURL(["cl", "seattle"]))
		    .toEqual("http://seattle.craigslist.org/");
	});
	it("Recovers if the user enters no tokens for a parameterized URL if it can", function() {
		expect(chromeAliaser.assembleURL(["yt"]))
		    .toEqual("http://www.youtube.com/");
		expect(chromeAliaser.assembleURL(["cl"]))
		    .toEqual("");
		expect(chromeAliaser.assembleURL(["map"]))
		    .toEqual("https://maps.google.com/maps");
		expect(chromeAliaser.assembleURL(["pint"]))
		    .toEqual("http://www.pinterest.com");
	});
	it("Leaves out the rest of the URL if not enough tokens are supplied", function() {
		expect(chromeAliaser.assembleURL(["pint", "kittens"]))
		    .toEqual("http://www.pinterest.com/kittens/");
		expect(chromeAliaser.assembleURL(["map", "2908%20Bryant%20Ave%20S"]))
		    .toEqual("https://maps.google.com/maps?q=2908%20Bryant%20Ave%20S");
	});
	it("Reset the data file", function() {
		setRawData("");
		expect(getRawData()).toEqual("");
	});
});