module.exports =
{
	parseSortString: function(sortString, defaultSort)
	{
		var s = sortString || defaultSort || "";
		
		var result = 
		{
			column:    "",
			direction: "asc"
		};
		
		//Split string on the space character into an array of tokens
		s = s.split(" ");
		
		//If no tokens return null
		if(s.length < 1) { return null; }
		
		//If at least 1 token, set the sort column as the 1st token
		result.column = s[0];
		
		//If column is empty return null
		if(!result.column) { return null; }
		
		//If only one token return result that sorts by that column in the ASC direction
		if(s.length === 1) { return result; }
		
		//If more than 1 token check if 2nd token is requesting a "DESC" direction
		if(s[1].toLowerCase() === "desc") { result.direction = "desc"; }
		
		return result;
	},
	
	//Given an array of ids Ex: [1,2] 
	//Returns a new array of M:M objects 
	//Ex: [{person_id:1, movie_id:4}, {person_id:2, movie_id:4}]
	idToMMObjArr: function (arrFieldName, idArray, otherFieldName, otherID)
	{
		return idArray.map(function(o)
		{
			var x = {};
			x[arrFieldName]   = o;
			x[otherFieldName] = otherID;
			return x;
		});
	},
	
	//Returns an object w/ the add/delete changes to make to a M:M table given the new/existing ids
	getMMDelta: function (newIDs, currentIDs, variableFieldName, constFieldName, constantID)
	{
		var i, ii, add = [], del = [], x;
	
		//Look for ids in newIDs that are NOT in currentIDs. These will be ADDS.  ([] of m:m objects)
		for(i = 0, ii = newIDs.length; i < ii; i++)
		{
			if(currentIDs.indexOf(newIDs[i]) == -1)
			{
				x = {};
				x[variableFieldName] = newIDs[i];
				x[constFieldName]    = constantID;
				add.push(x);
			}
		}
	
		//Look for ids in currentIDs that are NOT in newIDs. These will be DELETES.  ([] of ids only)
		for(i = 0, ii = currentIDs.length; i < ii; i++)
		{
			if(newIDs.indexOf(currentIDs[i]) == -1)
			{
				del.push(currentIDs[i]);
			}
		}
	
		return {add: add, del: del};
	},
};