new Vue({
    el: '#events',

    data: {
        event: { movement: '', weight: '', measurement: '', date: '', user: '' },
        events: [],
        editingEvent: {},
        userEmail: "",
        list: true,
        selectedEvent: 0

    },

    data() {
        return {
            authenticated: false,
            secretThing: '',
            lock: new Auth0Lock('uFD3IKN_en94nyvp4mswykUxN9qFgkIh', 'krisjhamilton.au.auth0.com'),
            notes: [{
                "title": "0.04",
                "description": "Update issues with browser refreshing and loss of data"
            }, {
                "title": "0.03",
                "description": "Squashed a stupid bug. Security Update: A RESTful action now takes care of the filtering of what gets downloaded."
            }, {
                "title": "0.02",
                "description": "Added 1RM percentages for each movements on List View. Select the 'Change View' button, then the % button on the coresponding table row to reveal a dialog box displaying percentages."
            }, {
                "title": "0.01",
                "description": "Initial Release"
            }],
            movements: [
                { movement: 'Back squat' },
                { movement: 'Box jump' },
                { movement: 'Clean and jerk' },
                { movement: 'Deadlift' },
                { movement: 'Front squat' },
                { movement: 'Overhead squat' },
                { movement: 'Power clean' },
                { movement: 'Power snatch' },
                { movement: 'Push jerk' },
                { movement: 'Push press' },
                { movement: 'Shoulder press' },
                { movement: 'Squat clean' },
                { movement: 'Squat snatch' },
                { movement: 'Split jerk' },
                { movement: 'Strict press' },
                { movement: 'Sumo deadlift' },
                { movement: 'Thruster' },
                { movement: 'Turkish get up' }
            ],
            selMovement: ''
        };
    },

    ready: function() {
        this.authenticated = checkAuth();
        this.lock.on('authenticated', (authResult) => {
            // console.log('authenticated');
            localStorage.setItem('id_token', authResult.idToken);
            this.lock.getProfile(authResult.idToken, (error, profile) => {
                if (error) {
                    // Handle error
                    return;
                }
                // Set the token and user profile in local storage
                localStorage.setItem('profile', JSON.stringify(profile));
                console.log(JSON.parse(localStorage.getItem('profile')));
                var email = JSON.parse(localStorage.getItem(['profile']));
                //console.log(email.email);
                userEmail = email.email;
                localStorage.setItem('email', JSON.stringify(userEmail));
                console.log(localStorage.getItem('email'));
                this.authenticated = true;
                console.log("Authentication " + this.authenticated);
                this.fetchEvents();
            });
        });

        if (JSON.parse(localStorage.getItem(['email'])) && this.authenticated) {
            // userEmail = JSON.parse(localStorage.getItem(['email']));
            // console.log(userEmail);
            // console.log(this.authenticated);
            // this.fetchEvents();
            this.refreshEvents();
        };

        this.lock.on('authorization_error', (error) => {

        });

    },

    methods: {

        login() {
            this.lock.show();
        },

        logout() {
            // To log out, we just need to remove the token and profile
            // from local storage
            localStorage.removeItem('id_token');
            localStorage.removeItem('profile');
            this.authenticated = false;
            console.log("Authentication " + this.authenticated);
        },

        listView: function() {
            var toggle = this.list;
            this.$set('list', !toggle);
            console.log("toggled");
        },

        refreshEvents: function() {
            if (JSON.parse(localStorage.getItem(['email'])) && this.authenticated) {
                userEmail = JSON.parse(localStorage.getItem(['email']));
                console.log(userEmail);
                console.log(this.authenticated);
                this.fetchEvents();
            };

        },

        fetchEvents: function() {
            var events = [];
            // console.log('https://api.backand.com/1/objects/action/movements/?name=test&parameters={"user":"' + userEmail + '"}');
            this.$http.headers.common['AnonymousToken'] = '6ffef82b-33ae-4436-b0b8-9369d7eba326';
            this.$http.get('https://api.backand.com/1/objects/action/movements/?name=test&parameters={"user":"' + userEmail + '"}')
                .success(function(eventsList) {
                    console.log(eventsList);
                    for (i = 0; i < eventsList.data.length; i++) {
                        if (eventsList.data[i].user == userEmail) {
                            events.push(eventsList.data[i]);
                        }
                    }
                    this.$set('events', events);
                    console.log(this.events);
                })
                .error(function(err) {
                    console.log(err);
                });
            // console.log(this.events);
        },

        addEvent: function() {
            if (this.event.movement.trim()) {
                console.log(this.event);
                // this.event.id;
                console.log("id = " + this.event.id);
                this.event.user = userEmail;
                console.log("user = " + this.event.user);
                this.events.push(this.event);
                console.log('Event added!' + this.event);
                console.log("Events are " + this.events);
                this.$http.headers.common['AnonymousToken'] = '6ffef82b-33ae-4436-b0b8-9369d7eba326';
                this.$http.post('https://api.backand.com/1/objects/movements/', this.event)
                    .success(function(res) {
                        this.fetchEvents();
                    })
                    .error(function(err) {
                        console.log(err);
                    });
            }
            console.log(this.events);
        },

        editEvent: function(event) {
            this.$set('editingEvent', event);
            //this.editingEvent.event = event;
        },

        endEditing: function(task) {
            console.log(task.id);
            var taskString = task.id.toString();
            selMovement = task.movement;
            this.$http.headers.common['AnonymousToken'] = '6ffef82b-33ae-4436-b0b8-9369d7eba326';
            this.$http.put('https://api.backand.com/1/objects/movements/' + taskString, task)
                .success(function(res) {
                    console.log(res);
                    this.fetchEvents();
                })
                .error(function(err) {
                    console.log(err);
                });
            this.editingEvent = {};
            // this.editingTask = false;
        },

        deleteEvent: function(index, movement) {
            if (confirm('Are you sure you want to remove the ' + movement + '?')) {
                // this.events.splice(index, 1);
                this.$http.headers.common['AnonymousToken'] = '6ffef82b-33ae-4436-b0b8-9369d7eba326';
                this.$http.delete('https://api.backand.com/1/objects/movements/' + index)
                    .success(function(res) {
                        console.log(res);
                        //this.events.splice(index, 1);
                        this.fetchEvents();
                    })
                    .error(function(err) {
                        console.log(event.id);
                        console.log(err);
                    });
            }
        },

        selectEvent: function(event) {
            this.$set('selectedEvent', event);
            console.log('clicked');
            console.log(this.selectedEvent);
        }
    },

    filters: {
        moment: function(date) {
            return moment(date).format('DD MMMM YYYY');
        },
        rounding: function(number, decimal_places) {
            if (typeof number === 'number' && typeof decimal_places === 'number') {
                var denominator = Math.pow(10, decimal_places),
                    rounded_number = Math.round(number * denominator) / denominator;

                return rounded_number;
            } else {
                return number;
            }
        }
    }
});

function checkAuth() {
    return !!localStorage.getItem('id_token');
}