
# Welcome to the CKEditor Accessibility Checker Demo!

This sample contains text with some accessibility problems. It will allow you to easily discover Accessibility Checker features. So, without further ado, let&#39;s move to the issues!

## Common Problems

### Wrong Header Level

Well, wouldn't it be just great if headers had a logical order? So that we won't see `h3` followed by `h6`? Unfortunately the next headline is an example of such inconsistency.

###### This is header with invalid level

### Paragraph Used to Imitate a Header

The next paragraph will be used to imitate a headline.

**This Should Be a Header Element**

### Invalid Lists

Some users, not familiar with structuring the content or WYSIWYG editors, tends to emulate lists with plain text instead of using dedicated list markup. Take this as an example:

1) foo <br>
2) bar <br>
3) baz <br>
4) bom

Wouldn't it be great to have this list based on `ol` and `li` elements?

### Subsequent Links

This line contains two subsequent anchor elements with identical "href" attribute value: <a href="http://ckeditor.com/about">read more </a><a href="http://ckeditor.com/about">at ckeditor.com</a>.

### Image File Name Given As An Alt

Some CMS'es generate alt based on file name. Well it's not a good practise. You must admit that `3ce00b07d39a1aeb2dd2.png` or `sample.jpg?timestamp=1431293422&fo-bar=baz-bom` aren't a good tale at all.

<img src="../../../samples/assets/sample.jpg?timestamp=1431293422&fo-bar=baz-bom" alt="sample.jpg?timestamp=1431293422&fo-bar=baz-bom" style="height:100px; width:80px" />

### Image Without Alt

This is a classic example. If an image has no alt then most readers will use its name as alternative text, which again is not a good idea.

<img src="../../../samples/assets/sample.jpg" style="height:100px; width:80px" />

### Table Without a Header

It's a good practise to use `th` elements to mark table headers.

<table>
	<tr>
		<td>Name</td>
		<td>Age</td>
	</tr>
	<tr>
		<td>John</td>
		<td>10</td>
	</tr>
	<tr>
		<td>Jane</td>
		<td>20</td>
	</tr>
	<tr>
		<td>James</td>
		<td>30</td>
	</tr>
</table>

## Real Use Sample

Now let's use the standard CKEditor "Apollo 11" sample.

### <img class="right" src="../../../samples/assets/sample.jpg"/> Apollo 11

<b>Apollo 11</b> was the spaceflight that landed the first humans, Americans <a href="http://en.wikipedia.org/wiki/Neil_Armstrong" title="Neil Armstrong">Neil Armstrong</a> and <a href="http://en.wikipedia.org/wiki/Buzz_Aldrin" title="Buzz Aldrin">Buzz Aldrin</a>, on the Moon on July 20, 1969, at 20:18 UTC. Armstrong became the first to step onto the lunar surface 6 hours later on July 21 at 02:56 UTC.</p> <p>Armstrong spent about <s>three and a half</s> two and a half hours outside the spacecraft, Aldrin slightly less; and together they collected 47.5 pounds (21.5&nbsp;kg) of lunar material for return to Earth. A third member of the mission, <a href="http://en.wikipedia.org/wiki/Michael_Collins_(astronaut)" title="Michael Collins (astronaut)">Michael Collins</a>, piloted the <a href="http://en.wikipedia.org/wiki/Apollo_Command/Service_Module" title="Apollo Command/Service Module">command</a> spacecraft alone in lunar orbit until Armstrong and Aldrin returned to it for the trip back to Earth.

#### Broadcasting and <em>quotes</em> <a id="quotes" name="quotes"></a>

Broadcast on live TV to a world-wide audience, Armstrong stepped onto the lunar surface and described the event as:

> One small step for [a] man, one giant leap for mankind.

<hr/>
<p style="text-align: right;"><small>Source: <a href="http://en.wikipedia.org/wiki/Apollo_11">Wikipedia.org</a></small></p>