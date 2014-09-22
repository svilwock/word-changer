"use strict";

(function () {
	var dict;
	var usedList;
	var letters;
	var firstBlank;
	var wordLength;
	var currWord;
	var dest;
	var adjList;
	var totalDistance;
	var possibilities;
	var currNode;
	var score;

	window.onload = function() {
		letters = document.querySelectorAll(".letters");
		wordLength = letters.length;
		document.onkeydown = backSpace;
		document.onkeypress = changeLetter;
		document.getElementById("hints").onchange = togglePossibilities;
		document.getElementById("skip").onclick = skip;
		firstBlank = 0;
		setScore(100);
		loadDict();
		loadAdjList();
		setDistance();
		setPath();
		var timer = setInterval(decrementScore, 10000);
	};

	function loadAdjList() {
		var ajax = new XMLHttpRequest();
		ajax.onload = getAdjList;
		ajax.open("GET", "dict" + wordLength + ".xml",false);
		ajax.send();
	}

	function getAdjList() {
		adjList = this.responseXML;
	}

	function setPath() {
		var parents = adjList.querySelectorAll("parent");
		var startNode = getRandom(parents);
		currNode = startNode;

		var visitedList = [currNode.getAttribute("word")];
		var distance = 0;
		var timesVisited = 0;

		while (distance <= totalDistance) { //Vary based on difficulty
			var nextNode = getRandom(currNode.childNodes);
			
			while(nextNode == null || timesVisited > 50) {
				startNode = getRandom(parents);
				currNode = startNode;

				visitedList = [currNode.getAttribute("word")];
				timesVisited = 0;
				distance = 0;
				nextNode = getRandom(currNode.childNodes); //Pick random adjacent word
			}

			if (contains(nextNode.getAttribute("word"),visitedList)) {
				timesVisited++;
			} else {
				currNode = parents[parseInt(nextNode.getAttribute("index"))];
				visitedList.push(currNode.getAttribute("word"));
				distance++;
			}
		}

		dest = currNode.getAttribute("word");
		currNode = startNode;
		currWord = currNode.getAttribute("word");
		document.getElementById("start").innerHTML = currWord;
		document.getElementById("end").innerHTML = dest;
		usedList = [currWord];
		
		for (var i = 0; i < wordLength; i++) {
			document.getElementById("prevLetter" + i).innerHTML = currWord[i].toUpperCase();
		}
		givePossibilities();
	}

	function setDistance() {
		var difficulty = window.location.search.replace("?length=" + wordLength + "&difficulty=", "");
		if (difficulty == "easy")
			totalDistance = 25;
		else if (difficulty == "medium")
			totalDistance = 75;
		else
			totalDistance = 150;
	}

	function getRandom(array) {
		return array[parseInt(Math.random() * array.length)];
	}

	function backSpace(event) {	
		if (event.keyCode == 8) { //Backspace
			if (firstBlank > 0) {
				var currBox = letters[firstBlank - 1];
				removeColor(currBox);
				currBox.innerHTML = "";
				firstBlank--;
			}
			return false;
		}
	}

	function changeLetter(event) {
		if ((event.keyCode >= 97 && event.keyCode <= 122) && firstBlank != wordLength) {
			var letter = String.fromCharCode(event.keyCode).toUpperCase();
			var currBox = letters[firstBlank];
			currBox.innerHTML = letter;
			if (letter != currWord[firstBlank].toUpperCase()) {
				currBox.classList.add("diff");
			}
			firstBlank++;
		} else if (event.keyCode == 13) { //Enter
			submitWord();
		}
	}

	function loadDict() {
		var ajax = new XMLHttpRequest();
		ajax.onload = getDict;
		ajax.open("GET", "dictionary.txt", true);
		ajax.send();
	}

	function getDict() {
		var dictionary = this.responseText;
		dict = dictionary.split(/\r\n|\n/);
	}

	function contains(word, list) {
		for (var i = 0; i < list.length; i++) {
			if (word == list[i]) {
				return true;
			}
		}
		return false;
	}

	function validChange(word, prevWord) {
		var diffCount = 0;
		if (prevWord.length == word.length) {
			for (var i = 0; i < wordLength; i++) {
				if (prevWord[i] != word[i]) {
					diffCount++;
				}
			}
		}
		return diffCount == 1;
	}

	function submitWord() {
		//var guess = document.getElementById("word").value.toLowerCase();
		
		var guess = "";
		for (var i = 0; i < wordLength; i++) {
			guess += letters[i].innerHTML.toLowerCase();
		}
		var invalidArea = document.getElementById("invalid");
		invalidArea.innerHTML = "";
		var message = document.createElement("p");
		if (!contains(guess, dict)) {
			message.innerHTML = guess + " is not a valid word.";
			invalidArea.appendChild(message);
		} else if (!validChange(guess, currWord)) {
			message.innerHTML = "Not a valid change.";
			invalidArea.appendChild(message);			
		} else if (contains(guess, usedList)) {
			message.innerHTML = guess + " has already been used.";
			invalidArea.appendChild(message);			
		} else if (guess == dest) {
			setScore(score + 100);
			setPath();
			alert("You got it!");
		}

		// The word typed is a valid change and has not been used yet
		if (contains(guess, dict) && validChange(guess, currWord) && !contains(guess, usedList)) {
			usedList.push(guess);
			currWord = guess;
			clearNext(true);
			givePossibilities();
		} else {
			clearNext(false);
		}
	}

	function skip() {
		setScore(score - 50);
		setPath();
	}

	function clearNext(valid) {
		for (var i = 0; i < wordLength; i++) {
			var prevLetter = document.getElementById("prevLetter" + i);
			if (valid) {
				prevLetter.innerHTML = letters[i].innerHTML;
			}
			removeColor(letters[i]);
			letters[i].innerHTML = "";
		}
		firstBlank = 0;
	}

	function removeColor(currBox) {
		if (currBox.classList.contains("diff")) {
			currBox.classList.remove("diff");
		}
	}

	function givePossibilities() {
		var children = currNode.childNodes;
		for (var i = 0; i < children.length; i++) {
			var nextNode = children[i];
			if (nextNode.getAttribute("word") == currWord) {
				currNode = adjList.querySelectorAll("parent")[nextNode.getAttribute("index")];
			}
		}
		possibilities = currNode.childNodes;
		var pos = document.getElementById("possibilities");
		pos.innerHTML = "";
		var heading = document.createElement("h2")
		heading.innerHTML = "Possibilities:";
		var posList = document.createElement("ul");
		for (var i = 0; i < possibilities.length; i++) {
			var possibility = possibilities[i].getAttribute("word");
			if(!contains(possibility, usedList)) {
				var element = document.createElement("li");
				element.innerHTML = possibilities[i].getAttribute("word");
				posList.appendChild(element);
			}
		}
		pos.appendChild(heading);
		pos.appendChild(posList);
	}

	function togglePossibilities() {
		var possibilities = document.getElementById("possibilities");
		if (this.checked) {
			possibilities.style.display = "block";
		} else {
			possibilities.style.display = "none";
		}
	}

	function setScore(amount) {
		score = amount;
		document.getElementById("score").innerHTML = score;
	}

	function decrementScore() {
		score -= 5;
		document.getElementById("score").innerHTML = score;
	}
})();
/*
	window.onload = function() {
		loadDict();
		document.onkeydown = backSpace;
		document.onkeypress = changeLetter;
		firstBlank = 0;
		letters = document.querySelectorAll(".letters");
		wordLength = letters.length;
		//var randoWord = dict[parseInt(Math.random() * dict.length)];
		//setUp(randoWord);
		//setUp("path");
		//currWord = "path";
		loadNext();
		//setUp();
	};
*/

/*
	function setUp() {
		currWord = nextGuess;
		dest = nextDest;
		document.getElementById("start").innerHTML = currWord;
		document.getElementById("end").innerHTML = dest;
		usedList = [currWord];
		
		for (var i = 0; i < wordLength; i++) {
			document.getElementById("prevLetter" + i).innerHTML = currWord[i].toUpperCase();
		}
		loadNext();
	}
*/

/*
	function loadNext() {
		var ajax = new XMLHttpRequest();
		ajax.onload = getNext;
		ajax.open("GET","dict" + wordLength + ".xml",true);
		ajax.send();
	}
*/
	//Randomly pick word (startWord)
	//var currWord = startWord
	//Add currWord current list
	//var n = 0
	//Depending on difficulty, do this X times (while n <= X) {
	//	Randomly pick word adjacent to currWord (nextWord)
	//	if (word isn't in current list) {
	//		currWord = nextWord
	//		Put currWord in current list
	//		n++;
	//		used = 0;
	//  } else {
	// 		used++;
	//  }
	//  //If we've randomly picked a word that was already used 50 times, pick a new start word 
	//  if (used > 50) {
	//		Randomly pick startWord;
	//		startWord = currWord;
	//		n = 0;
	//		visitedList = [];
	//		
	//  }
	//  
	//}

/*
	function getNext() {
		var words = this.responseXML.querySelectorAll("start");
		var numWords = words.length;
		var nextGuessNode = getRandom(words);
		var neighbors = nextGuessNode.querySelectorAll("next");
		var goodWord = false;
		nextGuess = nextGuessNode.getAttribute("word");
		for (var i = 0; i < neighbors.length; i++) {
			if (neighbors[i].getAttribute("distance") > 10) { // Change for difficulty
				goodWord = true;
			}
		}
		if (goodWord) {
			var nextDestNode = getRandom(neighbors);
			nextDest = nextDestNode.textContent;
			while (nextDestNode.getAttribute("distance") < 5) {
				nextDest = getRandom(neighbors).textContent;
				alert("hey");
			}
						// document.getElementById("end").innerHTML = dest;
						// document.getElementById("start").innerHTML = nextGuess;
		} else {
			loadNext();
		}
		// Setup only executed if a good word was chosen and currWord
		// hasn't been initialized (initial load)
		if (!currWord && goodWord) {
			alert("bad");
			setUp();
		}

		alert(nextGuess);					  // Still need to choose dest.
		alert(nextDest);
		//alert(nextDestNode.getAttribute("distance"));
	}

*/