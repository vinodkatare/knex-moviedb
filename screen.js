var prettyjson = require("prettyjson");

var screen =
{
	clear: function()
	{
		process.stdout.write("\033c");
	},
	
	write: function(data, mode)
	{
		var ops, output = data;
		
		if(mode === "json")
		{
			output = JSON.stringify(data, null, 4);
		}
		else if(mode === "pretty")
		{
			ops =
			{
				keysColor  : "cyan",
				dashColor  : "magenta",
				stringColor: "white",
				numberColor: "yellow"	
			};
			output = prettyjson.render(data, ops);
		}
		
		console.log(output);
	}
};

module.exports = screen;