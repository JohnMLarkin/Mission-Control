const passport = require('passport'),
      express = require('express'),
      router = express.Router(),
      randomString = require('randomatic');

const Organization = require('../models/organization'),
      Mission = require('../models/mission').Mission,
      Account = require('../models/account'),
      WayPoint = require('../models/waypoint'),
      podDataTypes = require('../models/mission').podDataTypes,
      accessControl = require('../helpers/accessControl');

module.exports = {
  showCreateOrg(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.onlyAdmin(req)) {
      res.render('createOrganization', ViewModel);
    } else {
      res.redirect('/login');
    }
  },
  createOrg(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.onlyAdmin(req)) {
      if (req.body.orgName) {
        Organization.findOne({name: {$regex: req.body.orgName}},
          (err, organization) => {
            if (err) {
              console.log('Error on Organization.findOne query');
              console.log(err);
            }
            if (!organization) {
              var newOrganization = new Organization({
                name: req.body.orgName,
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                zipcode: req.body.zipcode,
                contactName: req.body.contactName,
                contactEmail: req.body.contactEmail,
                url: req.body.url
              });
              newOrganization.save((err, organization) => {
                res.redirect('/organizationList');
                console.log('Organization created');
              });
            } else {
              ViewModel.error = 'Organization with that name already exists!';
              res.render('createOrganization', ViewModel);
            }
          }
        )
      } else {
        ViewModel.error = 'Organization name is a required field';
        res.render('createOrganization', ViewModel);
      }
    } else {
      res.redirect('/login');
    }
  },
  organizationList(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    ViewModel.organizations = [];
    Organization.find({}, {}, {sort: {name: 1}}, (err, organizations) => {
      if (err) {throw err};
      ViewModel.organizations = organizations;
      res.render('listOrganizations', ViewModel);
    });
  },
  createMission(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
      ViewModel.organizations = [];
      Organization.find({}, {}, {sort: {name: 1}}, (err, organizations) => {
        if (err) {throw err};
        ViewModel.organizations = organizations;
        ViewModel.createMissionJS = true;
        ViewModel.usesDatePicker = true;
        res.render('createMission', ViewModel);
      });
    } else {
      res.redirect('/login');
    }
  },
  addMission(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
      Mission.find({}, {}, {sort: {missionID: -1}}, (err, missions) => {
        if (err) {
          console.log('Error on Mission.find query');
          console.log(err);
        }
        var newMissionID;
        if (missions.length > 0) {
          newMissionID = missions[0].missionID + 1;
        } else {
          newMissionID = 1;
        }
        Organization.findOne({_id: req.body.organization},
          (err, organization) => {
            if (err) {
              console.log('Error on Organization.findOne query');
              console.log(err);
            }
            var newMission = new Mission({
              missionID: newMissionID,
              launchCode: randomString('a', 4),
              description: req.body.missionDescription,
              organizationID: organization._id,
              launchDate: req.body.predictedLaunchDate,
              createdByID: req.user._id
            });
            newMission.save((err, mission) => {
              //ViewModel.mission = mission;
              //ViewModel.organization = organization;
              //ViewModel.formattedLaunchDate = mission.launchDate.toDateString() + ' (tentative)';
              //ViewModel.createdByName = req.user.username;
              //req.session.missionOverviewData = ViewModel;
              res.redirect(`/plannedOverview/${newMissionID}`);
            });
        });
      });
    } else {
      res.redirect('/login');
    }
  },
  missionOverviewOld(req, res) {
    if (req.session.missionOverviewData) {
      var ViewModel = req.session.missionOverviewData;
      req.session.missionOverviewData = null;
    } else {
      var ViewModel = accessControl.navBarSupport(req.user);
    }
    if (!accessControl.flightDirectorOrAdmin(req)) {
      ViewModel.mission.launchCode = null;
    }
    res.render('missionOverviewOld', ViewModel);
  },
  plannedOverview(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (req.params.mission_id) {
      ViewModel.missionID = req.params.mission_id;
    }
    Mission.findOne({missionID: req.params.mission_id}, (err, mission) => {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        ViewModel.mission = mission;
        ViewModel.formattedLaunchDate = mission.launchDate.toDateString() + ' (tentative)';
        ViewModel.authorizedViewer = false;
        if (req.user) {
          if ((req.user._id == mission.createdByID) || (req.user.role == 'admin')) {
            ViewModel.authorizedViewer = true;
          }
        }
        let podData = [];
        let n = 0;
        for (let i = 0; i < mission.podManifest.length; i++) {
          if (mission.podManifest[i].dataTypes.length>0) {
            podData[n] = {};
            podData[n].id = i+1;
            podData[n].podDescription = mission.podManifest[i].podDescription;
            podData[n].data = [];
            for (let j = 0; j < mission.podManifest[i].dataTypes.length; j++) {
              podData[n].data[j] = {};
              podData[n].data[j].description = mission.podManifest[i].dataDescriptions[j];
              podData[n].data[j].dataType = mission.podManifest[i].dataTypes[j];
            }
            n++;
          }
        }
        ViewModel.podData = podData;
        Organization.findById(mission.organizationID,
          (err, organization) => {
            if (err) {
              console.log(err);
              res.redirect('/');
            } else {
              ViewModel.organization = organization;
              res.render('plannedOverview', ViewModel);
          }
        });
      }
    });
  },
  manageMissions(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.onlyAdmin(req)) {
      ViewModel.missions = [];
      ViewModel.organizations = [];
      Organization.find({}, {}, {sort: {name: 1}}, (err, organizations) => {
        ViewModel.organizations = organizations;
        var orgDict = {};
        for (let i=0; i<organizations.length; i++) {
          orgDict[organizations[i]._id] = organizations[i].name;
        }
        Account.find({}, {}, {}, (err, accounts) => {
          var userDict = {};
          for (let i = 0; i < accounts.length; i++) {
            userDict[accounts[i]._id] = accounts[i].username;
          }
          Mission.find({}, {}, {sort: {launchDate: -1}}, (err, missions) => {
            ViewModel.missions = missions;
            dictMissionDescription = {};
            for (let i=0; i<missions.length; i++) {
              ViewModel.missions[i].formattedLaunchDate = missions[i].launchDate.toISOString().substring(0, 10);
              ViewModel.missions[i].orgName = orgDict[missions[i].organizationID];
              ViewModel.missions[i].createdByName = userDict[missions[i].createdByID];
              //dictMissionDescription[String(missions[i]._id)] = missions[i].description;
            }
            //ViewModel.dictMissionDescription = dictMissionDescription;
            ViewModel.manageMissionsJS = true;
            ViewModel.usesDatePicker = true;
            ViewModel.usesDataTable = true;
            res.render('manageMissions', ViewModel);
          });
        });
      });
    }
  },
  modifyMission(req, res) {
    if (accessControl.flightDirectorOrAdmin(req)) {
      if (req.body.selectedMission) {
        var deleteMissionAllowed = false;
        var deleteWaypointsAllowed = false;
        Mission.findById(req.body.selectedMission,
          (err, mission) => {
            if (err) {console.log(err);}
            if (mission) {
              if (mission.launchCode === req.body.confirmAction) {
                switch (req.body.missionActionSelect) {
                  case 'Change status':
                    mission.status = req.body.statusSelect;
                    break;
                  case 'Change organization':
                    mission.organizationID = req.body.organization;
                    break;
                  case 'Change description':
                    mission.description = req.body.description;
                    break;
                  case 'Change planned launch date':
                    mission.launchDate = req.body.predictedLaunchDate
                    break;
                  case 'Delete mission':
                    if (mission.status === 'planned') {
                      deleteMissionAllowed = true;
                    }
                    break;
                  case 'Remove waypoints':
                    if (mission.status === 'planned') {
                      deleteWaypointsAllowed = true;
                    }
                  default:
                    console.log('Should not get here...');
                }
                if (deleteMissionAllowed) {
                  WayPoint.deleteMany({missionObjectId: req.body.selectedMission}, function (err) {});
                  Mission.deleteOne({_id: req.body.selectedMission}, function (err) {});
                } else if (deleteWaypointsAllowed) {
                  WayPoint.deleteMany({missionObjectId: req.body.selectedMission}, function (err) {});
                } else {
                  mission.save((err) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                }
                res.redirect('/manageMissions');
              } else {
                console.log('Launch code does not match');
              }
            }
          }
        );
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  }
}
