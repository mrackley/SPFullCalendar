/*
 * SPFullCalendar - Create a calendar view using FullCalendar.io and SharePoint Online Task list
 * Version 1.0 
 * @requires jQuery v1.11 or greater 
 * @requires jQuery, FullCalendar.io, Moment.js 
 *
 * Copyright (c) 2017 Mark Rackley / PAIT Group
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @description Create a calendar view using FullCalendar.io and SharePoint Online Task list
 * @type jQuery
 * @name SPFullCalendar
 * @category Plugins/SPFullCalendar
 * @author Mark Rackley / http://www.paitgroup.com / mrackley@paitgroup.com
 */

<script type="text/javascript" src="//code.jquery.com/jquery-1.11.1.min.js"></script> 
<script  type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js"></script>

<script  type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.4.0/fullcalendar.min.js"></script>
<link  type="text/css" rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.4.0/fullcalendar.min.css" /> 

<div id='calendar'></div>

<script type="text/javascript">

  var PATH_TO_DISPFORM = "https://<url to site>/Lists/Tasks/DispForm.aspx";
  var TASK_LIST = "Tasks";

   DisplayTasks();
   
   function DisplayTasks()
   {
  	$('#calendar').fullCalendar( 'destroy' );
    $('#calendar').fullCalendar({

        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,basicDay'
        },
        //open up the display form when a user clicks on an event
        eventClick: function (calEvent, jsEvent, view) {
			    window.location = PATH_TO_DISPFORM + "?ID=" + calEvent.id;
        },
       	editable: true,
        timezone: "UTC",
        droppable: true, // this allows things to be dropped onto the calendar
        //update the end date when a user drags and drops an event 
        eventDrop: function(event, delta, revertFunc) {
            UpdateTask(event.id,event.end);
          }, 
        //put the events on the calendar 
        events: function (start, end, timezone, callback) {
            startDate = start.format('YYYY-MM-DD');
            endDate = end.format('YYYY-MM-DD');
			
			var RESTQuery = "/_api/Web/Lists/GetByTitle('"+TASK_LIST+"')/items?$select=ID,Title,\
				Status,StartDate,DueDate,AssignedTo/Title&$expand=AssignedTo&\
				$filter=((DueDate ge '"+startDate+"' and DueDate le '"+endDate+"'))";
			
			var opencall = $.ajax({
		    		url: _spPageContextInfo.webAbsoluteUrl + RESTQuery,
		    		type: "GET",
		    		dataType: "json",
		    		headers: {
		    			Accept: "application/json;odata=verbose"
		    		}
		    });

            opencall.done(function (data, textStatus, jqXHR) {
			    	var events = [];
		    		for (index in data.d.results)
		    		{
						var assignedTo = "";
						for(person in data.d.results[index].AssignedTo.results)
						{
							assignedTo += data.d.results[index].AssignedTo.results[person].Title + " ";
						}
						events.push({
									title: data.d.results[index].Title + " - " + assignedTo,
									id: data.d.results[index].ID,
                  color: "#c00000", //specify the background color and border color can also create a class and use className paramter. 
									start: moment.utc(data.d.results[index].StartDate),
									end: moment.utc(data.d.results[index].DueDate).add("1","days") //add one day to end date so that calendar properly shows event ending on that day
								});
		    		}
					
					callback(events);
            
		    });
		}
	});
}


function UpdateTask(id,dueDate)
{
      //substract the previoulsy added day to the date to store correct date
			sDate =  moment.utc(dueDate).add("-1","days").format('YYYY-MM-DD') + "T" + 
					dueDate.format("hh:mm")+ ":00Z";
					
        var call = jQuery.ajax({
	        url: _spPageContextInfo.webAbsoluteUrl +
	            "/_api/Web/Lists/getByTitle('"+TASK_LIST+"')/Items(" + id + ")",
	        type: "POST",
	        data: JSON.stringify({
	            "__metadata": { type: "SP.Data.TasksListItem" },
	            DueDate: sDate,
	        }),
	        headers: {
	            Accept: "application/json;odata=verbose",
	            "Content-Type": "application/json;odata=verbose",
	            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
	            "IF-MATCH": "*",
	            "X-Http-Method": "PATCH"
	        }
        });
        call.done(function (data, textStatus, jqXHR) {
        	alert("Update Successful");
          DisplayTasks();
        });
        call.fail(function (jqXHR, textStatus, errorThrown) {
           alert("Update Failed");
           DisplayTasks();
        });

}



</script>
