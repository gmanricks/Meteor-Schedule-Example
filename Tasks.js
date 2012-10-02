Tasks = new Meteor.Collection("Tasks");
if (Meteor.is_client) {
	Meteor.autosubscribe(function () {
		if(typeof Session.get("User") != "undefined" && typeof Session.get("Pass") != "undefined")
		{	
			Meteor.subscribe("tasks", Session.get("User"), Session.get("Pass"));
		}
	});
	
	var Months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

	Template.Main.SignedIn = function(){
		return (typeof Session.get("User") == "undefined" || typeof Session.get("Pass") == "undefined") ? false : true;		
	};
	
	
	Template.Tasks.DayString = function(){
		var D = new Date(Session.get("Date"));
		return "Tasks for " + Months[D.getMonth()] + ", " + D.getDate();
	}
	
	Template.Tasks.Editing = function(){
		return Session.equals("Editing", this._id);
	}
	
	Template.Tasks.TasksForDate = function(){
		return Tasks.find({'Date': Session.get("Date")});
	}
	
	Template.Tasks.DateString = function(){
		var D = new Date(Session.get("Date"));
		return Months[D.getMonth()] + ", " + D.getFullYear();
	}
	
	Template.Tasks.GetDays = function(){
		var S = new Date(Session.get("Date"));
		var D = new Date(S.getYear(), S.getMonth()+1, 0);
		var Days = new Array({Number: "Su"}, {Number: "Mo"}, {Number: "Tu"}, {Number: "We"}, {Number: "Th"}, {Number: "Fr"}, {Number: "Sa"});
		for(var i = 0; i<D.getDay(); i++){ Days.push({Number : "&nbsp;"}); }
		for(var i = 0; i<D.getDate(); i++)
		{
			if(S.getDate() == i+1){ Days.push({'Number' : i+1, 'Class': " DaySelected"}); }
			else{ Days.push({'Number' : i+1, 'Class': " DayClick"}); }
		}
		return Days;
	}
	
	function Check(id, Done){
		Tasks.update({'_id': id}, { $set : {'Done' : !Done}});
	}
	
	function NewTask(){
		Tasks.insert({ 'User' : Session.get("User"), 'Pass' : Session.get("Pass"), 'Date' : Session.get("Date"), 'Done' : false, 'Name' : "New Task (Click To Edit)" });
	}
	
	function adjustMonth(Num){
		var D = new Date(Session.get("Date"));
		if(D.getDate() > 28){ D.setDate(28); }
		D.setMonth(D.getMonth()+Num);
		Session.set("Date", D.toDateString());	
	}
	
	Template.Login.events = {
		'click #LoginButton':function(){
			Session.set("User", document.getElementById("Username").value);
			Session.set("Pass", document.getElementById("Password").value);
			Session.set("Date", new Date().toDateString());
		}	
	};
	
	Template.Tasks.events = {
		'click #TodosButton':NewTask,
		'click #TodosBottom':NewTask,
		'click .RowText':function(){ Session.set("Editing", this._id); },
		'click .Close':function(){ Tasks.remove({'_id': this._id}); },
		'click #NextMonth': function(){ adjustMonth(1);  },
		'click #LastMonth': function(){ adjustMonth(-1); },
		'focus #TodosEdit':function(){ document.getElementById("TodosEdit").select(); },
		'blur #TodosEdit':function(){
			var tname = document.getElementById("TodosEdit").value;
			if(tname == "")
				tname = "New Task (Click To Edit)";
			Tasks.update({'_id': Session.get("Editing")}, {$set : {'Name': tname}}); 
			Session.set("Editing");
		},
		'click .DayClick':function(){
			var D = new Date(Session.get("Date"));
			D.setDate(this.Number);
			Session.set("Date", D.toDateString());
		}
	};

}

if (Meteor.is_server) {
  Meteor.publish("tasks", function(Username, Password){ return Tasks.find({User: Username, Pass: Password}); });
}
