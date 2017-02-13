window.onload = function () {

    var app = new Vue({

        el: '#app',

        data: {
            correctPerson: {},
            allCorrect: [],
            allPeople: [],
            decoys: [],
            total: 0,
            score: 0,
            chosenPersonId: -1,
            isCorrect: false,
            isIncorrect: false,
            resultView: false,
            finalScoreView: false,
            isLoading: true,
            token: 'your-token-here'
        },

        created: function () {
            this.fetchData()
        },

        methods: {

            fetchData: function () {
                var self = this;
                this.$http({
                    url: 'https://slack.com/api/users.list?token=' + token + '&presence=false',
                    method: 'GET'
                }).then(function (response) {
                    var data = response.body.members.filter(function (member) {
                        // filter all bots and deleted members
                        return (!member.deleted && !member.is_bot);
                    }).map(function (member) {
                        // let's map the data to a nice structure
                        var toReturn = {};
                        toReturn.id = member.id;
                        toReturn.title = ((member.profile.title != undefined) && (member.profile.title.length > 0)) ? member.profile.title : "No description listed";
                        if ((member.profile.image_original != undefined) && (member.profile.image_original != null)) {
                            toReturn.has_picture = true;
                        }
                        if ((member.profile.image_512 != undefined) && (member.profile.image_512 != null)) {
                            toReturn.picture_url = member.profile.image_512;
                        } else if ((member.profile.image_1024 != undefined) && (member.profile.image_1024 != null)) {
                            toReturn.picture_url = member.profile.image_1024;
                        } else if ((member.profile.image_192 != undefined) && (member.profile.image_192 != null)) {
                            toReturn.picture_url = member.profile.image_192;
                        } else if ((member.profile.image_original != undefined) && (member.profile.image_original != null)) {
                            toReturn.picture_url = member.profile.picture_url;
                        }
                        if ((member.real_name != undefined) && (member.real_name != null) && (member.real_name.length > 0)) {
                            toReturn.name = member.real_name;
                        } else if ((member.profile.real_name != undefined) && (member.profile.real_name != null) && (member.profile.real_name.length > 0)) {
                            toReturn.name = member.profile.real_name;
                        } else {
                            toReturn.name = member.name;
                        }
                        return toReturn;
                    }).filter(function (member) {
                        // filter everyone with no picture
                        return member.has_picture;
                    });
                    // assign the whole response to an array, then generate which pics to show
                    self.allPeople = data;
                    self.generatePictures();
                    self.isLoading = false;
                }, function (response) {
                    console.log("Catastrophic error! Call the Ghostbusters.")
                });
            },

            doSomething: function (id) {
                this.chosenPersonId = id;
                if (id === this.correctPerson.id) {
                    this.score = this.score + 1;
                    this.isCorrect = true;
                    this.isIncorrect = false;
                } else {
                    this.isCorrect = false;
                    this.isIncorrect = true;
                }
                this.resultView = true;
            },

            dismissResult: function () {
                this.resultView = false;
                if (this.total == 10) {
                    this.finalScoreView = true;
                    this.finalScore = (this.score / this.total * 100).toFixed(1);
                } else {
                    this.generatePictures();
                }
            },

            generatePictures: function () {
                var self = this;
                self.decoys = [];
                self.correctPerson = {};
                this.total = this.total + 1;

                // choose a correct person, make sure we haven't had them yet
                var n1 = this.generateRandom(self.allPeople.length, []);
                self.correctPerson = self.allPeople[n1];
                while ((self.allCorrect.indexOf(self.correctPerson.id) > -1)) {
                    n1 = this.generateRandom(self.allPeople.length, []);
                    self.correctPerson = self.allPeople[n1];
                }
                var numbersUsed = [n1];
                self.allCorrect.push(self.correctPerson.id);

                // choose decoys and add correct person to the decoy list
                var n2 = self.generateRandom(4, []); // index to insert correct person (this needs to be random)
                for (var i = 0; i < 3; i++) {
                    if (n2 == i) {
                        self.decoys.push(self.correctPerson);
                    }
                    var n3 = this.generateRandom(self.allPeople.length, numbersUsed);
                    var randomPerson = self.allPeople[n3];
                    while ((randomPerson.id == self.correctPerson.id)) {
                        n3 = this.generateRandom(self.allPeople.length, numbersUsed);
                        randomPerson = self.allPeople[n3];
                    }
                    numbersUsed.push(n3);
                    self.decoys.push(randomPerson);
                }
                if (n2 >= 3) {
                    self.decoys.push(self.correctPerson);
                }
            },

            generateRandom: function (limit, existing) {
                var min = 0;
                var max = limit;
                var number = Math.floor(Math.random() * (max - min)) + min;
                while (existing.indexOf(number) > -1) {
                    number = Math.floor(Math.random() * (max - min)) + min;
                }
                console.log("number:" + number);
                return number;
            }
        }


    });
};