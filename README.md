Using FullCalendar.io to Create Custom Calendars in SharePoint

One of the demos I teach during my SharePoint client side development workshops is how to use one of my favorite jQuery libraries FullCalendar.io. With this easy to use and quite powerful library you can create some pretty awesome calendar views for your lists and libraries in SharePoint. 
Why is this library better than the out of the box calendar views? Well, here are just a few of features using this library unlocks that you don’t get with out of the box calendar views:

1)	You can have multiple dates for an item on the calendar, not just a start date and end date
2)	You can easily customize the view to do things like not show Saturdays and Sundays. 
3)	You can easily customize the text displayed in for the event title. 
4)	You can customize what happens when someone clicks on an event.
5)	You can drag and drop events 
6)	You can style the calendar using jQueryUI themes
7)	You can easily apply different styles and colors to events
8)	You can make multiple RESTS queries or use Search to aggregate content from multiple lists
9)	It can easily work with the SharePoint Framework and on Modern Pages
Do I need to go on? I use this library all the time and it works great. I wanted to throw together an example that used several of the features of FullCalendar. 

The Basics

FullCalendar works by generating a calendar in a specific div on your page. So, for the most simple calendar example you could simply create an empty calendar by:

<div id='calendar'></div>
<script type=”text/javascript”>
    $('#calendar').fullCalendar({
        // put your options and callbacks here
    })
</script>

I’m not going to go into a lot of detail because FullCalendar has a lot of documentation and I’m lazy. However, the magic with this calendar comes when you specify different options and use various callbacks of full calendar. 
The main option you need to be concerned with is the Events option, specifically, using events as a function. This function gets executed every time a user changes to a different month and passes in the parameters of the dates that are visible on the calendar as start dates and end dates. This means, when this function is called we can execute our REST or Search queries using those dates as parameters to retrieve the data we care about and then push each result onto an array of events, which then gets rendered by FullCalendar. 

$('#calendar').fullCalendar({
    events: function(start, end, timezone, callback) {
        $.ajax({
            url: 'myxmlfeed.php',
            dataType: 'xml',
            data: {
                // our hypothetical feed requires UNIX timestamps
                start: start.unix(),
                end: end.unix()
            },
            success: function(doc) {
                var events = [];
                $(doc).find('event').each(function() {
                    events.push({
                        title: $(this).attr('title'),
                        start: $(this).attr('start') // will be parsed
                    });
                });
                callback(events);
            }
        });
    }
});

It is also in the events function where you could make multiple REST queries to read from multiple lists and create more complex REST queries that search against multiple dates. 
The Event Object
You can easy style each event as you push it into an array by using a couple of different parameters of the event object. You can create a different class for each event using the “className” parameter, or if you just want to change the color of an event you can specify the color using the “color” parameter which sets both the background and border of the event to that color. So, you could easily write code to style each event based on any data in your list including content type, status, department, etc…  

events.push({
     title: $(this).attr('title'),
     start: $(this).attr('start'), // will be parsed
     color: “#c00000” //sets background and border to red
});

You can also specify whether an event should span multiple days or just appear as one day in the calendar view. If you only want to show a specific date (due date of a task?) then specify the due date in the “start” parameter. If you want an event to span multiple days (start date of task to the due date) then you would need to specify both “start” and “end” parameters. One note, when you specify an “end” parameter, FullCalendar doesn’t display the event on that end date. It appears to use the logic that your event ended at the beginning of that day. So, if you want your event to display on that actual end date, you’ll need to increment the end date by one day as I do in my example below. This doesn’t fully make sense to me, but from reading others experiences it seems to be the case. 

Clicking and Drag and Drop events

In my example, I’ll be using both the click and drag and drop events in FullCalendar to show you that functionality in use. The cool thing is that when these events occur, you have access to the Event object for which it occurred so you can use the id of your list item to do additional functionality or maybe even just redirect the user to the display form.  
In my example, I’m going to take the user to the display form when they click on an event, and if they drag and drop an event, I’m going to update the due date of a task based on the day the user dropped the event:

eventClick: function (calEvent, jsEvent, view) {
                window.location = PATH_TO_DISPFORM + "?ID=" + calEvent.id;
        },
        //update the end date when a user drags and drops an event 
        eventDrop: function(event, delta, revertFunc) {
            UpdateTask(event.id,event.end);
          }, 

The Example

So, for this example I’m taking an out of the box Task list in SharePoint Online and displaying those tasks in a calendar view.  Also, as I mentioned previously you can click on an event to get to the display form and drag and drop an event to change the due date. Finally, I change the color of the events to red so that you can see how to change the colors. Using this template you should be able to create some really cool calendar views. 
