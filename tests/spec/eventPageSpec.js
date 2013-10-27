// set dataFilename to a test file name
aliaser.dataFilename = "testData";

function getRawData() {
    var value = window.localStorage.getItem(aliaser.dataFilename);

    if (!value) {
        window.localStorage.setItem(aliaser.dataFilename, "");
        value = "";
    }
    return value.trim();
}

function setRawData(value) {
    // replace the alias list in local storage, then
    // rebuild the master list map that's made from it
    window.localStorage.setItem(aliaser.dataFilename, value);
}

describe("AliaserList", function() {
	it("Data file is empty to start with", function() {
		setRawData("");
		expect(getRawData()).toEqual("");
	});
	it("Master List is empty to start with", function() {
		expect(aliaser.masterList).toEqual({});
	});
	it("Master List is returned empty from the init function", function() {
		expect(aliaser.initMasterList()).toEqual({});
	});
	it("Data file saves and retrieves properly", function() {
		setRawData("doomy doomy doom");
		expect(getRawData()).toEqual("doomy doomy doom");
		// reset the file back to empty
		setRawData("");
		expect(getRawData()).toEqual("");
    });
	it("Alias is added correctly", function() {
		aliaser.addAlias("doom", "http://www.doom.com");
		expect(getRawData()).toEqual("doom http://www.doom.com");
		expect(aliaser.masterList["doom"]).toEqual("http://www.doom.com");
	});
	it("An alias value without a protocol gets one added to it", function() {
		aliaser.addAlias("tak", "thehideousnewgirl");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl");
		expect(aliaser.masterList["tak"]).toEqual("http://thehideousnewgirl");
	});
	it("An alias with an https:// protocol gets added correctly", function() {
		aliaser.addAlias("map", "https://maps.google.com/map?q=%s&lci=%s");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s");
		expect(aliaser.masterList["map"]).toEqual("https://maps.google.com/map?q=%s&lci=%s");
	});
	it("An alias with a chrome:// protocol gets added correctly", function() {
		aliaser.addAlias("gir", "chrome://tacos");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s gir chrome://tacos");
		expect(aliaser.masterList["gir"]).toEqual("chrome://tacos");
	});
	it("An alias with an ftp:// protocol gets added correctly", function() {
		aliaser.addAlias("ftp", "ftp://sftp");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s gir chrome://tacos ftp ftp://sftp");
		expect(aliaser.masterList["ftp"]).toEqual("ftp://sftp");
	});
	it("An alias with a file:// protocol gets added correctly", function() {
		aliaser.addAlias("file", "file://undercover");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl map https://maps.google.com/map?q=%s&lci=%s gir chrome://tacos ftp ftp://sftp file file://undercover");
		expect(aliaser.masterList["file"]).toEqual("file://undercover");
	});
	it("Deletes aliases correctly from data file", function() {
		aliaser.removeAlias("map");
		expect(getRawData()).toEqual("doom http://www.doom.com tak http://thehideousnewgirl gir chrome://tacos ftp ftp://sftp file file://undercover");
		expect(aliaser.masterList["map"]).toEqual(undefined);
	});
	it("Replaces duplicates in data file on add", function() {
		aliaser.addAlias("tak", "taknewvalue");
		expect(getRawData()).toEqual("doom http://www.doom.com gir chrome://tacos ftp ftp://sftp file file://undercover tak http://taknewvalue");
		expect(aliaser.masterList["tak"]).toEqual("http://taknewvalue");
	});
	it("Exceptions at requests to add blank alias", function() {
		var testBlankAlias = function() {
		    aliaser.addAlias("", "blankaliastest");
		};
		expect(testBlankAlias).toThrow();
		expect(getRawData()).toEqual("doom http://www.doom.com gir chrome://tacos ftp ftp://sftp file file://undercover tak http://taknewvalue");
	});
	it("Exceptions at requests to add blank alias value", function() {
		var testBlankAliasValue = function() {
		    aliaser.addAlias("blank", "");
		};
		expect(testBlankAliasValue).toThrow();
		expect(getRawData()).toEqual("doom http://www.doom.com gir chrome://tacos ftp ftp://sftp file file://undercover tak http://taknewvalue");
	});
	it("Truncates too-long aliases", function() {
		//reset the dataFile
		setRawData("");
		// submit a 21-character alias
		aliaser.addAlias("thisaliasisalittletoolong", "justalittletoolong");
		expect(getRawData()).toEqual("thisaliasisalittleto http://justalittletoolong");
	});
	it("Exceptions if alias contains non-trailing, non-leading space", function() {
		var testSpaceyAlias = function() {
		    aliaser.addAlias("m ap", "maps.google.com");
		};
		expect(testSpaceyAlias).toThrow();
		expect(getRawData()).toEqual("thisaliasisalittleto http://justalittletoolong");
	});
	it("Exceptions if alias value contains non-trailing, non-leading space", function() {
		var testSpaceyAliasValue = function() {
		    aliaser.addAlias("map", "ma ps.google.com");
		};
		expect(testSpaceyAliasValue).toThrow();
		expect(getRawData()).toEqual("thisaliasisalittleto http://justalittletoolong");
	});
    it("Exceptions if url has quotes in it", function() {
        var testInvalidURL = function() {
            aliaser.addAlias("invalidurl", "urlwith\"quote");
        };
        expect(testInvalidURL).toThrow();
    });
	it("Ignores leading and trailing spaces", function() {
		aliaser.addAlias(" spacey   ", "  somanyspacesforsomereason    ");
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
		expect(aliaser.tokenize("one two three four"))
		    .toEqual(["one", "two", "three", "four"]);
	});
	it("Can cope with quoted strings at the beginning, middle, and end, alone, and as a group", function() {
		expect(aliaser.tokenize('"one two" three four "five six seven" eight "nine ten eleven"'))
		    .toEqual(["one%20two", "three", "four", "five%20six%20seven", "eight", "nine%20ten%20eleven"]);													      
		expect(aliaser.tokenize('one two "three four" five six'))
		    .toEqual(["one", "two", "three%20four", "five", "six"]);
		expect(aliaser.tokenize('"one two" three four five'))
		    .toEqual(["one%20two", "three", "four", "five"]);
		expect(aliaser.tokenize('one two "three four five"'))
		    .toEqual(["one", "two", "three%20four%20five"]);
		expect(aliaser.tokenize('"one two three four five"'))
		    .toEqual(["one%20two%20three%20four%20five"]);
	});
	it("Can cope with adjacent quoted strings", function() {
		expect(aliaser.tokenize('"one two" "three four" "five six seven" "eight nine"'))
		    .toEqual(["one%20two", "three%20four", "five%20six%20seven", "eight%20nine"]);
	});
	it("Can cope with a missing end quote", function() {
		expect(aliaser.tokenize('"one two" three "four five six'))
		    .toEqual(["one%20two", "three", "four%20five%20six"]);
	});
	it("Can cope with maverick spaces", function() {
		expect(aliaser.tokenize('   "   one two""three four"five        six "seven  eight     " nine   '))
		    .toEqual(["one%20two", "three%20four", "five", "six", "seven%20eight", "nine"]);
	});
});

describe("Assemble URL from tokens", function() {
	// First set the dataFile up with a set of aliases
	it("Setup the data file", function() {
		aliaser.addAlias("cl", "http://%s.craigslist.org/");
		aliaser.addAlias("plainjain", "http://www.sarahhagstrom.com/");
		aliaser.addAlias("map", "https://maps.google.com/maps?q=%s&lci=%s&z=%s");
		aliaser.addAlias("pint", "http://www.pinterest.com/%s/%s/");
		aliaser.addAlias("yt", "http://www.youtube.com/?q=%s");
		expect(aliaser.masterList["cl"]).toEqual("http://%s.craigslist.org/");
		expect(aliaser.masterList["plainjain"]).toEqual("http://www.sarahhagstrom.com/");
		expect(aliaser.masterList["map"]).toEqual("https://maps.google.com/maps?q=%s&lci=%s&z=%s");
		expect(aliaser.masterList["pint"]).toEqual("http://www.pinterest.com/%s/%s/");
		expect(aliaser.masterList["yt"]).toEqual("http://www.youtube.com/?q=%s");
	});
	// Try out some input
	it("Basically works", function() {
		expect(aliaser.assembleURL(["plainjain"]))
		    .toEqual("http://www.sarahhagstrom.com/");
		expect(aliaser.assembleURL(["yt", "kittens"]))
		    .toEqual("http://www.youtube.com/?q=kittens");
		expect(aliaser.assembleURL(["yt", "cute%20overload"]))
		    .toEqual("http://www.youtube.com/?q=cute%20overload");
		expect(aliaser.assembleURL(["pint", "kittens", "puppies"]))
		    .toEqual("http://www.pinterest.com/kittens/puppies/");
	        expect(aliaser.assembleURL(["map", "510%20Larkin%20St%20SF", "bike", "17"]))
		    .toEqual("https://maps.google.com/maps?q=510%20Larkin%20St%20SF&lci=bike&z=17");
	});
	it("Ignores extra tokens on a parameterless alias value", function() {
		expect(aliaser.assembleURL(["plainjain", "one", "two", "three"]))
		    .toEqual("http://www.sarahhagstrom.com/");
	});
	it("Gloms extra tokens into one at the end of a parameterized alias value", function() {
		expect(aliaser.assembleURL(["yt", "one", "two", "three"]))
		    .toEqual("http://www.youtube.com/?q=one%20two%20three");
	});
	it("Works when there's a parameter in the middle of the URL", function() {
		expect(aliaser.assembleURL(["cl", "seattle"]))
		    .toEqual("http://seattle.craigslist.org/");
	});
	it("Recovers if the user enters no tokens for a parameterized URL if it can", function() {
		expect(aliaser.assembleURL(["yt"]))
		    .toEqual("http://www.youtube.com/");
		expect(aliaser.assembleURL(["cl"]))
		    .toEqual("");
		expect(aliaser.assembleURL(["map"]))
		    .toEqual("https://maps.google.com/maps");
		expect(aliaser.assembleURL(["pint"]))
		    .toEqual("http://www.pinterest.com");
	});
	it("Leaves out the rest of the URL if not enough tokens are supplied", function() {
		expect(aliaser.assembleURL(["pint", "kittens"]))
		    .toEqual("http://www.pinterest.com/kittens/");
		expect(aliaser.assembleURL(["map", "2908%20Bryant%20Ave%20S"]))
		    .toEqual("https://maps.google.com/maps?q=2908%20Bryant%20Ave%20S");
	});
	it("Reset the data file", function() {
		setRawData("");
		expect(getRawData()).toEqual("");
	});
});