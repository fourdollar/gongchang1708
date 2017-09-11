var argv = require('argv')
, _    = require('lodash');

argv.option([
{
	name : 'memberlist',
	short: 'm',
	type : 'string',
	description : 'Member List File (JSON)'
},
{
	name : 'worklist',
	short: 'p',
	type : 'string',
	description : 'Work List File (JSON)'
},
{
	name : 'maxtrial',
	short: 'm',
	type : 'int',
	description : 'Max number of trials'
}
]);

var args = argv.run();

var _memberlist     = _.get(args, 'options.memberlist', '../server/data/assessment/members.json');
var _worklist       = _.get(args, 'options.worklist', '../server/data/patterns/worklist.json');
var _maxtrial       = _.get(args, 'options.maxtrial',  3);

var memberlist      = require(_memberlist);
var worklist        = require(_worklist);

var basedata = {
	"name": "patterns",
	"children": []
};

/////
// Simulation Parameters
var taskTime = {
	"CPU" : {
		"median": 20, "deviation": 10
	},
	"MEM" : {
		"median": 40, "deviation": 20
	},
	"MEM_C" : {
		"median": 10, "deviation": 3
	},
	"CARD" : {
		"median": 20, "deviation": 10
	},
	"CPU_C" : {
		"median": 15, "deviation": 5
	},
	"HDD" : {
		"median": 20, "deviation": 10
	},
	"POWER" : {
		"median": 30, "deviation": 10
	},
	"FAN" : {
		"median": 20, "deviation": 10
	},
	"COVER" : {
		"median": 30, "deviation": 20
	}
}
var workWeight = {
	"00001" : 2,
	"00002" : 3,
	"00003" : 6,
	"00004" : 10,
	"00005" : 1
};

function calcTime(work, who, k) {
	var w = taskTime[work];
	var v = w.median + Math.random()*100%w.deviation*workWeight[who]+Math.random()*10*k;
	return v;
}
/////


/// add worklist
for(var i = 0; i < worklist.data.length ; i ++ ){
	if(worklist.data[i].showinlist == true){
		basedata.children.push({
			"name": worklist.data[i].name,
			"label":true,
			"children": [
			]
		});
	}
}

/// add member's trial time
var times = 0;
for(var i = 0; i < worklist.data.length ; i ++ ){
	if(worklist.data[i].showinlist == true){
		for(var j = 0; j < memberlist.members.length ; j ++ ){
			var member = memberlist.members[j];
		
			basedata.children[i].children.push({
				"name": member.name,
				"id" : member.id,
				"children": []
			});
		
			/// max trial
			for(var k = 0; k < _maxtrial; k ++ ){
				var v = calcTime(worklist.data[i].name, member.id, (_maxtrial-k));
				basedata.children[i].children[j].children.push({
					"name": ""+ (+new Date)+(times++),
					"size": v.toFixed(1)
				});
			}
		}
	}
}


////
console.log(JSON.stringify(basedata));
