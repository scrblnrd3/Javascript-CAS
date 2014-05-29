var resultsDiv = document.getElementById("results");
function tex(str) {
	return toTex(new Equation(str).tree);
};

function texTree(tree) {
	return tex(displayTree(tree));
}

function texEqn(eqn) {
	return toTex(eqn.tree);
}
function stringifyPostfix(expression) {
	var str = "";
	var a = shunt(expression);
	for (var i = 0; i < a.length; i++) {
		str += a[i].txt + " ";
	}
	return str;
}
function stringy(arr) {
	var str = "";
	for (var i = 0; i < arr.length; i++) {
		str += arr[i].txt + " ";
	}
	return str;
}
function evaluateFunction(expression, variables) {
	return Math.round(tree(expression).evaluate(variables) * 1e10) / 1e10;
}
function differentiateFunction(expression, wrt, show) {
	
	var show = show || false;
	resultsDiv.innerHTML = "";
	var result = toTex(toTree(shunt(expression)).differentiate(wrt, show).simplify());
	
	resultsDiv.innerHTML += ("$$\\frac{d}{dx}\\left("
			+ toTex(tree(expression)) + "\\right)=" + result + "$$" + "<br>");
	MathJax.Hub.Queue([ "Typeset", MathJax.Hub ]);

}
function differentiateFunctionNoSimplify(expression, wrt, show) {
	
	var show = show || false;
	
	var result = toTex(toTree(shunt(expression)).differentiate(wrt, show));
	resultsDiv.innerHTML = "";
	resultsDiv.innerHTML += ("$$\\frac{d}{dx}\\left("
			+ toTex(tree(expression)) + "\\right)=" + result + "$$" + "<br>");
	MathJax.Hub.Queue([ "Typeset", MathJax.Hub ]);
}
function simplifyExpression(expression) {
	return simplify(toTree(shunt(expression)));
}
function tree(expression) {
	return toTree(shunt(expression));
}
function displayTree(tree) {
	return new Equation(tree).toString();
}

function evaluateTree(tree, variables) {

	if (tree instanceof Operand) {
		return tree.value;
	}
	if (tree.leftOperand !== undefined) {
		return tree.evaluate();

	} else {

		return tree.evaluate();
	}
}

function unitTest() {
	var expression = new Expression("1/2");

	console.log(displayTree(expression.tree.makeCommutative()));
}
function solve(first, second, guess) {
	return new Equation(first).solve(new Equation(second), -10, 10, guess);
}

function sign(x) {
	return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}

function eqn(str) {
	return new Equation(str);
}

Math.pow_ = Math.pow;

// redefine the method
Math.pow = function(_base, _exponent) {
	if (_base < 0) {
		if (Math.abs(_exponent) < 1) {
			// we're calculating nth root of _base, where n === 1/_exponent
			if (1 / _exponent % 2 === 0) {
				// nth root of a negative number is imaginary when n is even, we
				// could return
				// a string like "123i" but this would completely mess up
				// further computation
				return NaN;
			}
			// nth root of a negative number when n is odd
			return -Math.pow_(Math.abs(_base), _exponent);
		}
	} /* else if _base >=0 */
	// run the original method, nothing will go wrong
	return Math.pow_(_base, _exponent);
};

// Thanks to @o.v. for providing this code at
// http://stackoverflow.com/a/12813002/2027567

function integrate(expression, lower, upper, wrt) {
	resultsDiv.innerHTML = "$$\\int_"
			+ lower
			+ "^"
			+ upper
			+ "\\left("
			+ tex(expression)
			+ "\\right)"
			+ "dx"
			+ "="
			+ Math
					.round(eqn(expression)
							.integrate(lower, upper, (wrt || "x")) * 1e5) / 1e5
			+ "$$" + "<br>";

	MathJax.Hub.Queue([ "Typeset", MathJax.Hub ]);

}
function taylor(expression, order, center, respect) {

	var gcd = function(a, b) {
		if (!b) {
			return a;
		}

		return gcd(b, a % b);
	};

	var factorials = [
			1,
			1,
			2,
			6,
			24,
			120,
			720,
			5040,
			40320,
			362880,
			3628800,
			39916800,
			479001600,
			6227020800,
			87178291200,
			1307674368000,
			20922789888000,
			355687428096000,
			6402373705728000,
			121645100408832000,
			2432902008176640000,
			51090942171709440000,
			1124000727777607680000,
			25852016738884976640000,
			620448401733239439360000,
			15511210043330985984000000,
			403291461126605635584000000,
			10888869450418352160768000000,
			304888344611713860501504000000,
			8841761993739701954543616000000,
			265252859812191058636308480000000,
			8222838654177922817725562880000000,
			263130836933693530167218012160000000,
			8683317618811886495518194401280000000,
			295232799039604140847618609643520000000,
			10333147966386144929666651337523200000000,
			371993326789901217467999448150835200000000,
			13763753091226345046315979581580902400000000,
			523022617466601111760007224100074291200000000,
			20397882081197443358640281739902897356800000000,
			815915283247897734345611269596115894272000000000,
			33452526613163807108170062053440751665152000000000,
			1405006117752879898543142606244511569936384000000000,
			60415263063373835637355132068513997507264512000000000,
			2658271574788448768043625811014615890319638528000000000,
			119622220865480194561963161495657715064383733760000000000,
			5502622159812088949850305428800254892961651752960000000000,
			258623241511168180642964355153611979969197632389120000000000,
			12413915592536072670862289047373375038521486354677760000000000,
			608281864034267560872252163321295376887552831379210240000000000,
			30414093201713378043612608166064768844377641568960512000000000000,
			1551118753287382280224243016469303211063259720016986112000000000000,
			80658175170943878571660636856403766975289505440883277824000000000000,
			4274883284060025564298013753389399649690343788366813724672000000000000,
			230843697339241380472092742683027581083278564571807941132288000000000000,
			12696403353658275925965100847566516959580321051449436762275840000000000000,
			710998587804863451854045647463724949736497978881168458687447040000000000000,
			40526919504877216755680601905432322134980384796226602145184481280000000000000,
			2350561331282878571829474910515074683828862318181142924420699914240000000000000,
			138683118545689835737939019720389406345902876772687432540821294940160000000000000,
			8320987112741390144276341183223364380754172606361245952449277696409600000000000000,
			507580213877224798800856812176625227226004528988036003099405939480985600000000000000,
			31469973260387937525653122354950764088012280797258232192163168247821107200000000000000,
			1982608315404440064116146708361898137544773690227268628106279599612729753600000000000000,
			126886932185884164103433389335161480802865516174545192198801894375214704230400000000000000,
			8247650592082470666723170306785496252186258551345437492922123134388955774976000000000000000,
			544344939077443064003729240247842752644293064388798874532860126869671081148416000000000000000,
			36471110918188685288249859096605464427167635314049524593701628500267962436943872000000000000000,
			2480035542436830599600990418569171581047399201355367672371710738018221445712183296000000000000000,
			171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000,
			11978571669969891796072783721689098736458938142546425857555362864628009582789845319680000000000000000,
			850478588567862317521167644239926010288584608120796235886430763388588680378079017697280000000000000000,
			61234458376886086861524070385274672740778091784697328983823014963978384987221689274204160000000000000000,
			4470115461512684340891257138125051110076800700282905015819080092370422104067183317016903680000000000000000,
			330788544151938641225953028221253782145683251820934971170611926835411235700971565459250872320000000000000000,
			24809140811395398091946477116594033660926243886570122837795894512655842677572867409443815424000000000000000000,
			1885494701666050254987932260861146558230394535379329335672487982961844043495537923117729972224000000000000000000,
			145183092028285869634070784086308284983740379224208358846781574688061991349156420080065207861248000000000000000000,
			11324281178206297831457521158732046228731749579488251990048962825668835325234200766245086213177344000000000000000000,
			894618213078297528685144171539831652069808216779571907213868063227837990693501860533361810841010176000000000000000000,
			71569457046263802294811533723186532165584657342365752577109445058227039255480148842668944867280814080000000000000000000,
			5797126020747367985879734231578109105412357244731625958745865049716390179693892056256184534249745940480000000000000000000,
			475364333701284174842138206989404946643813294067993328617160934076743994734899148613007131808479167119360000000000000000000,
			39455239697206586511897471180120610571436503407643446275224357528369751562996629334879591940103770870906880000000000000000000,
			3314240134565353266999387579130131288000666286242049487118846032383059131291716864129885722968716753156177920000000000000000000,
			281710411438055027694947944226061159480056634330574206405101912752560026159795933451040286452340924018275123200000000000000000000,
			24227095383672732381765523203441259715284870552429381750838764496720162249742450276789464634901319465571660595200000000000000000000,
			2107757298379527717213600518699389595229783738061356212322972511214654115727593174080683423236414793504734471782400000000000000000000,
			185482642257398439114796845645546284380220968949399346684421580986889562184028199319100141244804501828416633516851200000000000000000000,
			16507955160908461081216919262453619309839666236496541854913520707833171034378509739399912570787600662729080382999756800000000000000000000,
			1485715964481761497309522733620825737885569961284688766942216863704985393094065876545992131370884059645617234469978112000000000000000000000,
			135200152767840296255166568759495142147586866476906677791741734597153670771559994765685283954750449427751168336768008192000000000000000000000,
			12438414054641307255475324325873553077577991715875414356840239582938137710983519518443046123837041347353107486982656753664000000000000000000000,
			1156772507081641574759205162306240436214753229576413535186142281213246807121467315215203289516844845303838996289387078090752000000000000000000000,
			108736615665674308027365285256786601004186803580182872307497374434045199869417927630229109214583415458560865651202385340530688000000000000000000000,
			10329978488239059262599702099394727095397746340117372869212250571234293987594703124871765375385424468563282236864226607350415360000000000000000000000,
			991677934870949689209571401541893801158183648651267795444376054838492222809091499987689476037000748982075094738965754305639874560000000000000000000000,
			96192759682482119853328425949563698712343813919172976158104477319333745612481875498805879175589072651261284189679678167647067832320000000000000000000000,
			9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000,
			933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000,
			93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000 ];

	var texString = "$$"

	var wrt = respect || "x";
	var coefficients = eqn(expression).Taylor(order, center, wrt);

	for (var i = 0; i < coefficients.length; i++) {
		var coefficient = Math.round(coefficients[i] * 1e7) / 1e7;
		var denominator = factorials[i];
		if (center == 0) {
			x = "x";
		} else if (center > 0) {
			x = "(x-" + center + ")";
		} else {
			x = "(x+" + -center + ")";
		}

		if (coefficient % 1 === 0) {
			var g = gcd(coefficient, denominator);

			coefficient /= Math.abs(g);
			denominator /= Math.abs(g);

			if (coefficient !== 0) {
				if (Math.abs(coefficient) === 1) {
					if (coefficient > 0) {
						texString += "+"
								+ ((tex(x + "^" + i + "/" + denominator)));
					} else {
						texString += "-"
								+ ((tex(x + "^" + i + "/" + denominator)));

					}
				} else {
					if (coefficient > 0) {
						texString += "+"
								+ ((tex(coefficient + x + "^" + i + "/"
										+ denominator)));
					} else {
						texString += "-"
								+ ((tex(-coefficient + x + "^" + i + "/"
										+ denominator)));

					}
				}
			}
		} else {

			if (new Fraction(coefficient, denominator).denominator > 1e5) {
				if (coefficient > 0) {
					texString += "+"
							+ ((tex(coefficient + x + "^" + i + "/"
									+ denominator)));

				} else {
					texString += "-"
							+ ((tex(-coefficient + x + "^" + i + "/"
									+ denominator)));

				}
			} else {
				var fraction = new Fraction(coefficient, denominator);
				coefficient = fraction.numerator;
				denominator = fraction.denominator;
				if (coefficient > 0) {
					texString += "+"
							+ ((tex(coefficient + x + "^" + i + "/"
									+ denominator)));

				} else {
					texString += "-"
							+ ((tex(-coefficient + x + "^" + i + "/"
									+ denominator)));

				}
			}

		}
	}

	texString = texString.substring(3);
	texString = "$$" + texString;
	texString += "$$";

	resultsDiv.innerHTML = texString;
	MathJax.Hub.Queue([ "Typeset", MathJax.Hub ]);

}

function getInfo(expression, lower, upper, respect, subintervals, tolerance) {

	var subintervals = subintervals || 100;
	var wrt = respect || "x";
	var tolerance = tolerance || Equation.prototype.epsilon;

	
	lower = new Equation(lower).evaluate();
	upper = new Equation(upper).evaluate();
	
	var fn = new Equation(expression);

	var zeroes = new Equation(expression).solveZeroes(lower, upper, wrt,
			subintervals, tolerance);

	resultsDiv.innerHTML = "";
	resultsDiv.innerHTML += "<div style = 'font-size: 150%'>$y="
			+ texEqn(fn) + "$</div><br><br>";

	zeroes = zeroes.map(function(x) {
		return Math.round(x * 1e5) / 1e5;
	});

	zeroes = zeroes.filter(function(element, position) {
		return zeroes.indexOf(element) === position;
	});

	resultsDiv.innerHTML += "<div style = 'font-size: 125%'>$\\text {Zeroes: } $</div><br>"
	for (var i = 0; i < zeroes.length; i++) {
		resultsDiv.innerHTML += "$" + wrt + "=" + zeroes[i] + "$<br>"
	}

	var firstDerivative = simplify(fn.differentiate(wrt));

	var criticals = firstDerivative.solveZeroes(lower, upper, wrt,
			subintervals, tolerance);

	resultsDiv.innerHTML += "<br><br><div style = 'font-size: 150%'>$\\frac{dy}{dx} = "
			+ texEqn(firstDerivative) + "$</div><br><br>";

	criticals = criticals.map(function(x) {
		return Math.round(x * 1e5) / 1e5;
	});

	criticals = criticals.filter(function(element, position) {
		return criticals.indexOf(element) === position;
	});

	resultsDiv.innerHTML += "<div style = 'font-size: 125%'>$\\text {Critical Points: } $</div><br>"
	for (var i = 0; i < criticals.length; i++) {
		resultsDiv.innerHTML += "$" + wrt + "=" + criticals[i] + "$<br>"
	}

	criticals.unshift(Math.round(lower * 1e5) / 1e5);
	criticals.push(Math.round(upper * 1e5) / 1e5);

	criticals = criticals.filter(function(element, position) {
		return criticals.indexOf(element) === position;
	});

	var criticalIntervals = [];

	var numIntervals = 0;

	for (var i = 0; i < criticals.length - 1; i++) {

		var sgn = sign(firstDerivative.evaluate(wrt,
				(criticals[i] + criticals[i + 1]) / 2));

		var prevSign = null;
		if (numIntervals > 0) {

			prevSign = criticalIntervals[numIntervals - 1].sign;
		}

		if (prevSign == sgn) {
			criticalIntervals[numIntervals - 1].upper = criticals[i + 1];
		} else {
			criticalIntervals.push({
				"lower" : criticals[i],
				"upper" : criticals[i + 1],
				"sign" : sgn
			});

			numIntervals++;

		}

	}

	var mins = [];
	var maxes = [];

	for (var i = 0; i < criticalIntervals.length; i++) {

		if (i === 0) {
			if (criticalIntervals[0].sign === -1) {
				maxes.push({
					"x" : criticalIntervals[i].upper,
					"y" : Math.round(fn.evaluate(wrt,
							criticalIntervals[i].upper) * 1e5) / 1e5,
					"type" : "local"

				});

				mins.push({
					"x" : criticalIntervals[i].lower,
					"y" : Math.round(fn.evaluate(wrt,
							criticalIntervals[i].lower) * 1e5) / 1e5,
					"type" : "local"
				});

			} else {
				mins.push({
					"x" : criticalIntervals[i].upper,
					"y" : Math.round(fn.evaluate(wrt,
							criticalIntervals[i].upper) * 1e5) / 1e5,
					"type" : "local"
				});

				maxes.push({
					"x" : criticalIntervals[i].lower,
					"y" : Math.round(fn.evaluate(wrt,
							criticalIntervals[i].lower) * 1e5) / 1e5,
					"type" : "local"
				});
			}
		} else {
			if (criticalIntervals[i].sign === 1) {

				mins.push({
					"x" : criticalIntervals[i].upper,
					"y" : Math.round(fn.evaluate(wrt,
							criticalIntervals[i].upper) * 1e5) / 1e5,
					"type" : "local"
				});
			} else {
				maxes.push({
					"x" : criticalIntervals[i].upper,
					"y" : Math.round(fn.evaluate(wrt,
							criticalIntervals[i].upper) * 1e5) / 1e5,
					"type" : "local"
				});
			}
		}
	}

	var temp = maxes;
	maxes = mins;
	mins = temp;
	var globalMin = Infinity;

	for (var i = 0; i < mins.length; i++) {
		if (mins[i].y < globalMin) {
			globalMin = mins[i].y;
		}
	}

	for (var i = 0; i < mins.length; i++) {
		if (mins[i].y === globalMin) {
			mins[i].type = "global";
		}
	}

	var globalMax = -Infinity;
	var globalMaxNums = [];
	for (var i = 0; i < maxes.length; i++) {
		if (maxes[i].y >= globalMax) {
			globalMax = maxes[i].y;

		}
	}

	for (var i = 0; i < maxes.length; i++) {
		if (maxes[i].y === globalMax) {
			maxes[i].type = "global";
		}
	}

	resultsDiv.innerHTML += "<br>"
	resultsDiv.innerHTML += "<div style = 'font-size: 125%'>$\\text{Minima: }$</div><br>";
	for (var i = 0; i < mins.length; i++) {

		resultsDiv.innerHTML += "$\\text{"
				+ ((mins[i].type === "local") ? "Local" : "Global")
				+ " minimum at } (" + mins[i].x + "," + mins[i].y + ")$<br>";
	}

	resultsDiv.innerHTML += "<br>"
	resultsDiv.innerHTML += "<div style = 'font-size: 125%'>$\\text{Maxima: }$</div><br>";

	for (var i = 0; i < maxes.length; i++) {

		resultsDiv.innerHTML += "$\\text{"
				+ ((maxes[i].type === "local") ? "Local" : "Global")
				+ " maximum at } (" + maxes[i].x + "," + maxes[i].y + ")$<br>";
	}

	var decIntervals = [];
	var incIntervals = [];

	resultsDiv.innerHTML += "<br><div style = 'font-size: 125%'>$\\text{Intervals of increasing and decreasing: }$</div><br>";

	var incString = "$\\text{Increasing: }$ $\\nobreakspace";
	var decString = "$\\text{Decreasing: }$ $\\nobreakspace";
	var incStringAdd = "";
	var decStringAdd = "";
	for (var i = 0; i < criticalIntervals.length; i++) {
		if (criticalIntervals[i].sign === -1) {
			decStringAdd += "(" + criticalIntervals[i].lower + ","
					+ criticalIntervals[i].upper + ")\\cup";
		} else {
			incStringAdd += "(" + criticalIntervals[i].lower + ","
					+ criticalIntervals[i].upper + ")\\cup";
		}

	}

	
	resultsDiv.innerHTML += incString + incStringAdd.slice(0, -4) + "$<br>";

	resultsDiv.innerHTML += decString + decStringAdd.slice(0, -4) + "$<br>";

	var secondDerivative = simplify(firstDerivative.differentiate(wrt));

	var inflections = secondDerivative.solveZeroes(lower, upper, wrt,
			subintervals, tolerance);
	
	resultsDiv.innerHTML += "<br><br><div style = 'font-size: 150%'>$\\frac{d^2y}{dx^2} = "
			+ texEqn(secondDerivative) + "$</div><br><br>";

	inflections = inflections.map(function(x) {
		return Math.round(x * 1e5) / 1e5;
	});

	inflections = inflections.filter(function(element, position) {
		return inflections.indexOf(element) === position;
	});

	resultsDiv.innerHTML += "<div style = 'font-size: 125%'>$\\text {Points of Inflection: } $</div><br>"
	for (var i = 0; i < inflections.length; i++) {
		resultsDiv.innerHTML += "$" + wrt + "=" + inflections[i] + "$<br>"
	}
	resultsDiv.innerHTML += "<br>";

	inflections.unshift(Math.round(lower * 1e5) / 1e5);
	inflections.push(Math.round(upper * 1e5) / 1e5);

	inflections = inflections.filter(function(element, position) {
		return inflections.indexOf(element) === position;
	});

	var inflectionIntervals = [];

	var numIntervals = 0;

	for (var i = 0; i < inflections.length - 1; i++) {

		var sgn = sign(secondDerivative.evaluate(wrt,
				(inflections[i] + inflections[i + 1]) / 2));

		var prevSign = null;
		if (numIntervals > 0) {

			prevSign = inflectionIntervals[numIntervals - 1].sign;
		}

		if (prevSign == sgn) {
			inflectionIntervals[numIntervals - 1].upper = inflections[i + 1];
		} else {
			inflectionIntervals.push({
				"lower" : inflections[i],
				"upper" : inflections[i + 1],
				"sign" : sgn
			});

			numIntervals++;

		}

		

	}
	
	var ccupString = "$\\text{Concave Up: }    ";
	var ccdownString = "$\\text{Concave Down: }    "

	for (var i = 0; i < inflectionIntervals.length; i++) {

		if (inflectionIntervals[i].sign === -1) {
			ccdownString += "(" + inflectionIntervals[i].lower + ","
					+ inflectionIntervals[i].upper + ")\\cup";
		} else {
			ccupString += "(" + inflectionIntervals[i].lower + ","
					+ inflectionIntervals[i].upper + ")\\cup";
		}

	}
	

	resultsDiv.innerHTML += ccupString.slice(0, -4) + "$<br>";
	resultsDiv.innerHTML += ccdownString.slice(0, -4) + "$";

	MathJax.Hub.Queue([ "Typeset", MathJax.Hub ]);

}

function simplify(exp) {
	var last = "";
	var current = exp;

	while (current.toString() !== last) {
		last = current.toString();

		current.tree = (current.tree.simplify());

	}

	return current;
}

