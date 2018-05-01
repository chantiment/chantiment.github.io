/**
 * 
 */
function ChantimentView()
{	
	// Member values
	this.url;
	this.terms;
	this.datestart;
	this.dateend;
	this.granularity;
	
	this.datedistance;
	
	this.canApiCall					= true;
	this.apiUrlHost					= "http://api.chantiment.com/_/api/chan/bizstats?";
	this.apiUrl;
	
	this.zeroResultDates			= [ '2017-11-06',
	                    				'2017-11-07',
	                    				'2017-11-08',
	                    				'2017-11-09',
	                    				'2017-11-10',
	                    				'2017-11-11',
	                    				'2017-11-12',
	                    				'2017-11-13',
	                    				'2017-11-14',
	                    				'2017-11-23',
	                    				'2017-11-24',
	                    				'2017-11-30',
	                    				'2017-12-01',
	                    				'2017-12-02',
	                    				'2017-12-29',
	                    				'2017-12-30',
	                    				'2018-01-18' ];	
	
	this.backgroundColors			= [	'rgba(255, 99, 132, 0.2)',
										'rgba(54, 162, 235, 0.2)',
										'rgba(255, 206, 86, 0.2)',
										'rgba(75, 192, 192, 0.2)',
										'rgba(153, 102, 255, 0.2)',
										'rgba(255, 159, 64, 0.2)'];
	this.borderColors				= [	'rgba(255,99,132,1)',
										'rgba(54, 162, 235, 1)',
										'rgba(255, 206, 86, 1)',
										'rgba(75, 192, 192, 1)',
										'rgba(153, 102, 255, 1)',
										'rgba(255, 159, 64, 1)' ];
	
	// Private global value
	var that						= this;
	
	
	/**
	 * Intitialize the view. 
	 **/
	this.initView			= function(  )
	{
		// Prevent the event of the return key to submit the form
		$(document).ready( function() 
		{
			$( window ).keydown(function(event)
			{
				if( event.keyCode == 13 )
				{
					event.preventDefault();
					return false;
				}
			});
		});
		
		this.initExportBtnHandler();
		this.initDateDistanceHandler();
	}

	
	/**
	 * Format the given response data to a readable format for chartjs.
	 * 
	 * @apiData	array with response data
	 */
	this.formatApiData			= function( apiData )
	{
		var retArray			= new Array();
		retArray['volumes']		= new Array();
		retArray['dataset']		= new Array();
		
		
		$.each( apiData.volumes, function( index, element )
		{
			//console.log( index, element );
			retArray['volumes'].push( index ); 
		});
		
		$.each( apiData.terms, function( index, termWord )
		{
			//console.log( index, termWord, apiData.results[termWord] );
			var dataSet					= {};
			dataSet.label				= termWord;
			dataSet.backgroundColor		= that.backgroundColors[index];
			dataSet.borderColor			= that.borderColors[index];
			dataSet.data				= new Array();
			
			var lastValue				= 0;
			
			$.each( apiData.results[termWord], function( volume, resultSet )
			{
				//console.log( volume, resultSet.mentions.total );
				if( resultSet.mentions.total == 0 )
				{
					if( -1 !== $.inArray( volume, that.zeroResultDates ) )
					{
						//console.log( 'Found missing value',   );
						dataSet.data.push( lastValue );
					}
				}
				else
				{
					dataSet.data.push( resultSet.mentions.total );
					lastValue	= resultSet.mentions.total;
				}
			});
			
			retArray['dataset'].push( dataSet );
		});
		return retArray;
	}
	
	
	/**
	 * Call the api and load the response by given input data for selection.
	 */
	this.callApi				= function()
	{
		if( this.canApiCall	== true  )
		{
			this.buildApiUrl();
			if( this.apiUrl !== undefined )
			{
				//Call the api
				$.getJSON( this.apiUrl, function( data )
				{
					// Set spinner off
					$( '#chartContainer' ).css( "background-image", "none");
					
					// Format the response data for chart
					var formattedData 	= that.formatApiData( data );
					var ctx 			= document.getElementById("chartObj").getContext('2d');
					var progress 		= document.getElementById('animationProgress');
					var myChart 		= new Chart(ctx, {
					    type: 'line',
					    data: {
					        labels: formattedData['volumes'],
					        datasets: formattedData['dataset'] 
					    },
					    options: {
					        scales: {
					            yAxes: [{
					                ticks: {
					                    beginAtZero:true
					                }
					            }]
					        },
					        animation: 
					        {
					        	duration: 2000,
								onProgress: function(animation) 
								{
									//progress.value = animation.currentStep / animation.numSteps;
								},
								onComplete: function(animation) 
								{
									window.setTimeout(function() {
									//	progress.value = 0;
									}, 2000);
								}
			                }
					    }
					});
				});
			}
		}
		else
		{
			//console.log( 'Not allowed to call the API' );
		}
	}
	
	
	/**
	 * Build the url string from host and the member values. 
	 * 
	 * @csv string Param which can be 0 or 1. 
	 */
	this.buildApiUrl			= function( csv )
	{
		if( csv == undefined )
		{
			csv = "0";
		}
		this.apiUrl		= this.apiUrlHost	+ 
						  'terms=' + this.terms + 
						  '&csv=' + csv + 
						  '&granularity=' + this.granularity + 
						  '&datestart=' + this.datestart + 
						  '&dateend=' + this.dateend;
	}
	
	
	/**
	 * Call the function for initialize the term input field.
	 */
	this.initTermsField			= function()
	{
		this.initGoTermsBtnHandler();
		this.initTermsInputHandler();
	}
	

	/**
	 * Init the inputosaurus plugin 
	 */
	this.initTermsInputHandler	= function()
	{
		$( '#terms' ).inputosaurus( );
		$( '.inputosaurus-input input' ).on( 'keyup keydown change focus blur', function( event )
		{
			//console.log( 'event.which', event );
			if( event.which == 13 
			 )
			{
				//console.log( 'keydown', event.which );
				that.checkTermValueCount( false, function()
				{
					//console.log( event );
					$( '#dataForm' ).submit();					
				});
			}
		});
	}
	
	
	/** 
	 * Call api url with csv flag and open its in a new window.
	 */
	this.initGoTermsBtnHandler	= function()
	{
		$( '#submitData' ).on( 'click touchend', function( event )
		{
			event.preventDefault();
			//console.log( 'terms add Click' );
			
			that.checkTermValueCount( false, function()
			{
				var e = jQuery.Event("keydown");
				e.which = 13; // # Some key code value
				$(".inputosaurus-input input").trigger(e);
				
				$( '#dataForm' ).submit();
			});
		});
	}
	
	
	/**
	 * Method to check the amount of terms, before the user can add a new one.
	 * 
	 * @callback Funtion which will be execute if the amount is not over 3.
	 */
	this.checkTermValueCount	= function( callbackBoolCall, callback )
	{
		var values		= $('#terms').val();
		var arrValues 	= values.split( "," );
		//console.log( arrValues.length, arrValues.length > 3 );
		
		if( arrValues.length > 3 
		 || ( arrValues.length == 3 && $( '.inputosaurus-input input').val() !== "" ) )
		{
			alert( "You don't have to search more than 3 terms. Please remove one, before you add a new one." );
			if( callbackBoolCall === false )
			{
				return false;
			}
		}
				
        if( callback !== undefined
         && typeof callback === "function" ) 
		{
		    callback();
		}	
	}
	
	
	/** 
	 * Call api url with csv flag and open its in a new window.
	 */
	this.initExportBtnHandler	= function()
	{
		$( '#exportCSV' ).on( 'click touchend', function( event )
		{
			event.preventDefault();
			//console.log( 'exportCSV Click' );
			if( that.canApiCall	== true  )
			{
				that.buildApiUrl( "1" );
				if( that.apiUrl !== undefined )
				{
					window.open( that.apiUrl, '_blank' );
				}
			}
		});
	}
	
	
	/** 
	 * Handler for checking the dropdown of date selection
	 */
	this.initDateDistanceHandler	= function()
	{
		$( '#datedistance' ).on( 'change', function( event )
		{
			event.preventDefault();
			//console.log( 'datedistance change', event, this.value );
			that.calcDateDistances( this.value );
		});
	}
	
	
	/**
	 * Calculate the start and end date by given select value from distance
	 * 
	 * @value string, possible values are custom, 1year, 3months, 1month
	 */
	this.calcDateDistances			= function( value )
	{
		if( value == 'custom' )
		{
			// Show fields
			$( '#datestart' ).css( 'display', 'inline-block' );
			$( '#dateend' ).css( 'display', 'inline-block' );
		}
		else
		{
			// Hide fields
			$( '#datestart' ).css( 'display', 'none' );
			$( '#dateend' ).css( 'display', 'none' );
			
			// Get datetime from today
			var currentdate		= new Date();
			var currentDay		= currentdate.getDate();
			currentDay			= ( currentDay < 10 ) ? '0'+currentDay: currentDay;
			var currentMonth	= currentdate.getMonth()+1;
			currentMonth		= ( currentMonth < 10 ) ? '0'+currentMonth: currentMonth;
			var dateEnd			= currentdate.getFullYear() + '-' + currentMonth + '-' + currentDay;
			$( '#dateend' ).val( dateEnd );
			
			if( value == '1year' )
			{
				var lastYear 		= new Date( currentdate.getFullYear() -1, 
										 		currentdate.getMonth(), 
										 		currentdate.getDate());
				
				var lastYearDay		= lastYear.getDate();
				lastYearDay			= ( lastYearDay < 10 ) ? '0'+lastYearDay: lastYearDay;
				var lastYearMonth	= lastYear.getMonth()+1;
				lastYearMonth		= ( lastYearMonth < 10 ) ? '0'+lastYearMonth: lastYearMonth;
				var dateStart		= lastYear.getFullYear() + '-' + lastYearMonth + '-' + lastYearDay;
				$( '#datestart' ).val( dateStart );
				//console.log( 'Last year', dateStart );
			}
			else if( value == '3months' )
			{
				var last3Months			= new Date( currentdate.getFullYear(), 
													currentdate.getMonth() - 3, 
													currentdate.getDate() );

				var last3MonthsDay		= last3Months.getDate();
				last3MonthsDay			= ( last3MonthsDay < 10 ) ? '0'+last3MonthsDay: last3MonthsDay;
				var last3MonthsMonth	= last3Months.getMonth()+1;
				last3MonthsMonth		= ( last3MonthsMonth < 10 ) ? '0'+last3MonthsMonth: last3MonthsMonth;
				var dateStart			= last3Months.getFullYear() + '-' + last3MonthsMonth + '-' + last3MonthsDay;
				$( '#datestart' ).val( dateStart );
				//console.log( 'Last 3 months', dateStart );
			}
			else if( value == '1month' )
			{
				var lastMonth		= new Date( currentdate.getFullYear(), 
												currentdate.getMonth() - 1, 
												currentdate.getDate() );

				var lastMonthDay	= lastMonth.getDate();
				lastMonthDay		= ( lastMonthDay < 10 ) ? '0'+lastMonthDay: lastMonthDay;
				var lastMonthMonth	= lastMonth.getMonth()+1;
				lastMonthMonth		= ( lastMonthMonth < 10 ) ? '0'+lastMonthMonth: lastMonthMonth;
				var dateStart		= lastMonth.getFullYear() + '-' + lastMonthMonth + '-' + lastMonthDay;
				$( '#datestart' ).val( dateStart );
				//console.log( 'Last month', dateStart );
			}
		}
	}
	
	
	/**
	 * Method to check the grabbed get params and set them as member values. 
	 * Otherwise call the animation method to show the user, that one or more values are missing.
	 */
	this.checkParams			= function()
	{
		
		var query	= window.location.search.substring(1);
		var qs 		= this.parseQueryString( query );
		//console.log( 'qs', qs );
		
		// Check terms
		if( qs.terms == ""
		 || typeof qs.terms == 'undefined' )
		{
			//console.log( 'Terms not set' );
			this.canApiCall	= false;
			if( typeof qs.submitDataFlag !== 'undefined' )
			{
				this.missingInput( 'ul.inputosaurus-container' );
				this.missingInput( 'ul.inputosaurus-container .inputosaurus-input' );
				this.missingInput( 'ul.inputosaurus-container .inputosaurus-input input' );
				this.canApiCall	= false;
			}
		}
		else if( qs.terms !== "" )
		{
			this.terms 	= qs.terms;
		}
		
		// Check granularity
		if( qs.granularity !== "" )
		{
			this.granularity 	= qs.granularity;
		}
		else if( typeof qs.submitDataFlag !== 'undefined' )
		{
			this.missingInput( '#granularity' );
			this.canApiCall	= false;
		}
		
		// Check date distance
		if( qs.datedistance !== "" )
		{
			this.datedistance 	= qs.datedistance;
			that.calcDateDistances( this.datedistance );
		}
		else if( typeof qs.submitDataFlag !== 'undefined' )
		{
			this.missingInput( '#datedistance' );
			this.canApiCall	= false;
		}
		
		// Check date start
		if( qs.datestart !== "" )
		{
			this.datestart 	= qs.datestart;
		}
		else if( typeof qs.submitDataFlag !== 'undefined' )
		{
			this.missingInput( '#datestart' );
			this.canApiCall	= false;
		}
		
		// Check date end
		if( qs.dateend !== "" )
		{
			this.dateend 	= qs.dateend;
		}
		else if( typeof qs.submitDataFlag !== 'undefined' )
		{
			this.missingInput( '#dateend' );
			this.canApiCall	= false;
		}
	}
	
	
	/**
	 * Set the class values to the form input fields.
	 */
	this.buildFormValues					= function()
	{
		// Set term values
		if( this.terms !== undefined )
		{
			$( '#terms' ).val( this.terms );
		}
		
		// Set date distance
		if( this.datedistance !== undefined )
		{
			$( '#datedistance' ).val( this.datedistance );
		}
		
		// Set date start values
		if( this.datestart !== undefined )
		{
			$( '#datestart' ).val( this.datestart );
		}
		
		// Set date end values
		if( this.dateend !== undefined )
		{
			$( '#dateend' ).val( this.dateend );
		}
		
		// Set granularity values
		if( this.granularity !== undefined )
		{
			$( '#granularity' ).val( this.granularity );
		}
	}
	
	
	/**
	 * Jquery UI Method for animate the inputfields in red to show the user, that one data input is missing.
	 * 
	 * @fieldId string Jquery Id Select
	 */
	this.missingInput						= function( fieldId )
	{
		$( fieldId ).animate( { backgroundColor: '#EF4851', color: "#ffffff" }, 1000 );
		setTimeout( function()
		{
			$( fieldId ).animate( { backgroundColor: '#FFFFFF', color: "#1C1C30" }, 1000, 'swing' );
		}, 2000 );
	}
	
	
	/**
	 * Method to extract the GET Parameters from the url
	 * 
	 * @query string Query string from the url 
	 */
	this.parseQueryString					= function( query )
	{
		var vars				= query.split("&");
		var queryString		= {};
		
		for( var i = 0; i < vars.length; i++ )
		{
			var pair	= vars[i].split( "=" );
			if( typeof queryString[pair[0]] === "undefined") // If first entry with this name
			{
				queryString[pair[0]]	= decodeURIComponent(pair[1]);
			} 
			else if ( typeof queryString[pair[0]] === "string" ) // If second entry with this name
			{
				var arr					= [queryString[pair[0]], decodeURIComponent(pair[1])];
				queryString[pair[0]]	= arr;
			} 
			else // If third or later entry with this name
			{
				queryString[pair[0]].push( decodeURIComponent( pair[1] ) );
			}
		}
		return queryString;
	}
};