Vue.component('modal', {
    template: '#bs-modal',
    data: function() {
        console.log("### DATA");
    },
});

new Vue({
    el: '#events',

    data: {
        event: { movement: '', weight: '', measurement: '', date: '', user: '' },
        events: [],
        // editingTask: false,
        editingEvent: {},
        userEmail: "",
        list: true,
        selectedEvent: 0
    },
    data() {
        return {
            authenticated: false,
            secretThing: '',
            lock: new Auth0Lock('uFD3IKN_en94nyvp4mswykUxN9qFgkIh', 'krisjhamilton.au.auth0.com')
        }
    },

    ready: function() {
        // this.fetchEvents();

        var self = this;

        this.authenticated = checkAuth();

        this.lock.on('authenticated', (authResult) => {
            console.log('authenticated');
            localStorage.setItem('id_token', authResult.idToken);
            this.lock.getProfile(authResult.idToken, (error, profile) => {
                if (error) {
                    // Handle error
                    return;
                }
                // Set the token and user profile in local storage
                localStorage.setItem('profile', JSON.stringify(profile));
                var email = JSON.parse(localStorage.getItem(['profile']));
                //console.log(email.email);
                userEmail = email.email;
                //console.log(user);
                this.authenticated = true;
                this.fetchEvents();
            });
        });

        this.lock.on('authorization_error', (error) => {
            // handle error when authorizaton fails
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
        },

        listView: function() {
            var toggle = this.list;
            this.$set('list', !toggle);
            console.log("toggled");
        },

        refreshEvents: function() {
            this.fetchEvents();
        },

        fetchEvents: function() {
            console.log(userEmail);
            var events = [];
            this.$http.headers.common['AnonymousToken'] = '6ffef82b-33ae-4436-b0b8-9369d7eba326';
            this.$http.get('https://api.backand.com/1/objects/movements')
                .success(function(eventsList) {
                    for (i = 0; i < eventsList.data.length; i++) {
                        if (eventsList.data[i].user == userEmail) {
                            events.push(eventsList.data[i]);
                        }
                    }
                    this.$set('events', events);
                    console.log(events);
                })
                .error(function(err) {
                    console.log(err);
                });
        },

        addEvent: function() {
            if (this.event.movement.trim()) {
                console.log(this.event);
                this.event.id;
                this.event.user = userEmail;
                this.events.push(this.event);
                console.log('Event added!');
                console.log(this.event);
                this.$http.headers.common['AnonymousToken'] = '6ffef82b-33ae-4436-b0b8-9369d7eba326';
                this.$http.post('https://api.backand.com/1/objects/movements/', this.event)
                    .success(function(res) {
                        console.log(res);
                        this.fetchEvents();
                    })
                    .error(function(err) {
                        console.log(err);
                    });
            }
            console.log(this.event);
        },

        editEvent: function(event) {
            this.$set('editingEvent', event);
            //this.editingEvent.event = event;
        },

        endEditing: function(task) {
            console.log(task.id);
            var taskString = task.id.toString();
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

        deleteEvent: function(index) {
            if (confirm('Are you sure?' + index)) {
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