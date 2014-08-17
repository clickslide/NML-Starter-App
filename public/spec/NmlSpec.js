describe("NML Immediately After Inistantiation", function () {
    var nml = new NML();
    it("is constructed", function () {
        expect(typeof nml).toBe('object');
    });
    it("has no logged in user", function () {
        expect(nml.Session).toBeNull();
    });
    it("has no base url", function (done) {
        expect(nml.getBaseUrl()).toBeNull();
        done();
    });
    describe("NML Prepared for Execution", function () {
        it("has a base url", function () {
            nml.setBaseUrl(appconfig.url, 'https', 'datadipity.com');
            expect(nml.getBaseUrl()).not.toBe(null);
        });
    });
    describe("User Can Login", function () {
        it("via http", function (done) {
            nml.Login(jasmine_config.email, jasmine_config.pass, function (data) {
                nml.onLogin(data);
                done();
            });
        });
        it("and successfully set NML session after login", function () {
            expect(nml.getSession).not.toBeNull();
        });
    });
    describe("User Can get homePage", function () {
        it("via http", function (done) {
            nml.get(function (data) {
                jasmine_config.json = JSON.parse(data);
                nml.setHomePageId(jasmine_config.json.ListPage['@attributes'].id);
                nml.search = jasmine_config.json.ListPage.search;
                $("#get").html('<span class="glyphicon glyphicon-ok"></span> GET').attr("class", "label label-success");
                done();
            }, jasmine_config.nocache, jasmine_config.postparams);
        }, 30000);
        describe("<ListPage>", function () {
            it("should be an object", function () {
                expect(typeof jasmine_config.json.ListPage).toBe('object');
            });

            it("and validate the application has the correct document", function () {
                expect(jasmine_config.json.ListPage['@attributes'].id).toBe(nml.getHomePageId());
            });

            describe("<search>", function () {
                it("should be "+nml.search, function () {
                    console.log("Search?");
                    console.log(nml.search);
                    expect(jasmine_config.json.ListPage.search).toBe(nml.search);
                });
            });
            describe("<url>", function () {
                it("should be null", function () {
                    expect(Object.keys(jasmine_config.json.ListPage.url).length).toBe(0);
                });
            });
            describe("<pages>", function () {
                it("should be a collection of BasicPages", function () {
                    expect(jasmine_config.json.ListPage.pages.BasicPage.length).toBeGreaterThan(0);
                });
                describe("<BasicPage>", function () {
                    describe("<searchPage>", function () {
                        describe("<ListPage>", function () {
                            describe("<pages>", function () {
                                it("should be a collection of BasicPages", function () {
                                    expect(jasmine_config.json.ListPage.pages.BasicPage[1].searchPage.ListPage.pages["BasicPage"]).toBeDefined();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});