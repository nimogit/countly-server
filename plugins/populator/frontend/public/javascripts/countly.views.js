window.PopulatorView = countlyView.extend({
	initialize:function () {
	},
    beforeRender: function() {
		if(!this.template){
			var self = this;
			return $.when($.get(countlyGlobal["path"]+'/populator/templates/populate.html', function(src){
				self.template = Handlebars.compile(src);
			})).then(function () {});
		}
    },
    renderCommon:function (isRefresh) {
		this.templateData = {
			"page-title":jQuery.i18n.map["populator.title"]
		};
		var now = new Date();
		var fromDate = new Date(now.getTime()-1000*60*60*24*30);
		var toDate = now;
		
		
		$(this.el).html(this.template(this.templateData));
		$("#start-populate").on('click', function() {
			fromDate = $( "#populate-from" ).datepicker( "getDate" ) || fromDate;
			toDate = $( "#populate-to" ).datepicker( "getDate" ) || toDate;
			countlyPopulator.setStartTime(fromDate.getTime()/1000);
			countlyPopulator.setEndTime(toDate.getTime()/1000);
			countlyPopulator.generateUsers(parseInt($("#populate-users").val()));
			$("#start-populate").hide();
			$("#stop-populate").show();
		});
		$("#stop-populate").on('click', function() {
			countlyPopulator.stopGenerating();
			$("#stop-populate").hide();
			$("#start-populate").show();
		});
		
		$("#populate-explain").on('click', function() {
			CountlyHelpers.alert(jQuery.i18n.map["populator.help"], "green");
		});
		
		if(countlyPopulator.isGenerating()){
			$("#start-populate").hide();
			$("#stop-populate").show();
			countlyPopulator.generateUI();
			$( "#populate-users" ).val(countlyPopulator.getUserAmount());
			$( "#populate-from" ).val(moment(countlyPopulator.getStartTime()*1000).format("YYYY-MM-DD"));
			$( "#populate-to" ).val(moment(countlyPopulator.getEndTime()*1000).format("YYYY-MM-DD"));
			$( "#populate-from" ).datepicker({dateFormat: "yy-mm-dd", defaultDate:new Date(countlyPopulator.getStartTime()*1000), constrainInput:true, maxDate: now });
			$( "#populate-to" ).datepicker({dateFormat: "yy-mm-dd", defaultDate:new Date(countlyPopulator.getEndTime()*1000), constrainInput:true, maxDate: now });
		}
		else{
			$( "#populate-from" ).val(moment(fromDate).format("YYYY-MM-DD"));
			$( "#populate-to" ).val(moment(toDate).format("YYYY-MM-DD"));
			$( "#populate-from" ).datepicker({dateFormat: "yy-mm-dd", defaultDate:-30, constrainInput:true, maxDate: now });
			$( "#populate-to" ).datepicker({dateFormat: "yy-mm-dd", constrainInput:true, maxDate: now });
		}
		app.localize();
    },
    refresh:function () {}
});

//register views
app.populatorView = new PopulatorView();

app.route('/manage/populate', 'populate', function () {
    if(countlyGlobal["member"].global_admin || countlyGlobal["admin_apps"][countlyCommon.ACTIVE_APP_ID]){
        this.renderWhenReady(this.populatorView);
    }
    else{
        app.navigate("/", true);
    }
});

app.addPageScript("#", function(){
	if (Backbone.history.fragment.indexOf("/manage/populate") > -1) {
        $("#sidebar-app-select").addClass("disabled");
        $("#sidebar-app-select").removeClass("active");
    }
});

$( document ).ready(function() {
    if(!production){
        CountlyHelpers.loadJS("populator/javascripts/chance.js");
    }
    var style = "display:none;";
    if(countlyGlobal["member"].global_admin || countlyGlobal["admin_apps"][countlyCommon.ACTIVE_APP_ID]){
        style = "";
    }
    var menu = '<a href="#/manage/populate" class="item" id="populator-menu" style="'+style+'">'+
        '<div class="logo-icon fa fa-random"></div>'+
        '<div class="text" data-localize="populator.title"></div>'+
    '</a>';
    if($('#management-submenu .help-toggle').length)
        $('#management-submenu .help-toggle').before(menu);
    
    //listen for UI app change
    $(".app-container:not(#app-container-new)").live("click", function () {
        setTimeout(function(){   
            if(countlyGlobal["member"].global_admin || countlyGlobal["admin_apps"][countlyCommon.ACTIVE_APP_ID]){
                $("#populator-menu").show();
            }
            else{
                $("#populator-menu").hide();
            }
        }, 1000);
    });
});