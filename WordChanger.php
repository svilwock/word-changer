<?php
	if (!isset($_GET["length"]) || !isset($_GET["difficulty"])) {
		die("Select Length and Difficulty");
	}
	$length = $_GET["length"];
	$difficulty = $_GET["difficulty"];
	$width = 105 * $length;
?>

<!DOCTYPE html>
<html>
<head>
	<title>Word Changer</title>
	<link rel="stylesheet" type="text/css" href="WordChanger.css">
	<link href="wkey.jpg" type="image/gif" rel="shortcut icon">
	<script type="text/javascript" src="WordChanger.js"></script>
</head>

<body>
	<div id="sidebar">
		<p>Score: </p>
		<div id="score"></div>
		<div id="possibilities"></div>
		<div><label><input type="checkbox" id="hints">Hints On?</label></div>
	</div>
	<div id="main">
		<div id="path">
			<p>Start From: <span id="start"></span></p>
			<p>Get To: <span id="end"></span></p>
		</div>

		<div id="words" max-width="<?= $width ?>px">
			<div id="prevWord">
			<?php
				for ($i = 0; $i < $length; $i++) {
					?>
					<div class="prevLetters" id="prevLetter<?= $i ?>"></div>
				<?php } ?>
			</div>

			<div id="currWord">
			<?php
				for ($i = 0; $i < $length; $i++) {
					?>
					<div class="letters" id="letter<?= $i ?>"></div>
				<?php } ?>
			</div>
			<div id="invalid"></div>
			<div id="next"><input type="button" id="skip" value="skip"></button></div>
		</div>
	</div>
</body>

</html>