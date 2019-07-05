const passport = require('passport'),
      express = require('express'),
      router = express.Router(),
      randomString = require('randomatic');

const Organization = require('../models/organization'),
      Mission = require('../models/mission').Mission,
      Account = require('../models/account'),
      WayPoint = require('../models/waypoint'),
      Announcement = require('../models/announcement'),
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
              console.log(err);
              res.status(404).send(err);
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
      if (err) {res.status(404).send(err)};
      ViewModel.organizations = organizations;
      res.render('listOrganizations', ViewModel);
    });
  },
  createMission(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
      ViewModel.organizations = [];
      Organization.find({}, {}, {sort: {name: 1}}, (err, organizations) => {
        if (err) {res.status(404).send(err)};
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
          res.status(404).send(err);
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
              res.status(404).send(err);
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
              res.redirect(`/plannedOverview/${newMissionID}`);
            });
        });
      });
    } else {
      res.redirect('/login');
    }
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
        if (mission) {
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
              podData[n].fc_id = mission.podManifest[i].fc_id;
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
        } else {
          res.status(404).send(err);
        }
      }
    });
  },
  manageMissions(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
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
          var userSearchField;
          if (req.user.role === 'admin') {
            userSearchField = {};
          } else {
            for (let i = 0; i < accounts.length; i++) {
              if (accounts[i].username === req.user.username) userSearchField = {createdByID: req.user.username};
            }
          }
          Mission.find(userSearchField, {}, {sort: {launchDate: -1}}, (err, missions) => {
            ViewModel.missions = missions;
            dictMissionDescription = {};
            for (let i=0; i<missions.length; i++) {
              ViewModel.missions[i].formattedLaunchDate = missions[i].launchDate.toISOString().substring(0, 10);
              ViewModel.missions[i].orgName = orgDict[missions[i].organizationID];
              ViewModel.missions[i].createdByName = userDict[missions[i].createdByID];
            }
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
  },
  createAnnouncement(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
      ViewModel.createAnnouncementJS = true;
      ViewModel.usesDatePicker = true;
      res.render('createAnnouncement', ViewModel);
    } else {
      res.redirect('/login');
    }
  },
  addAnnouncement(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
      if (req.body.expires) {
        var newAnnouncement = new Announcement({
          title: req.body.announcementTitle,
          body: req.body.announcementBody,
          expires: true,
          expireDate: req.body.expireDate,
          createdByName: req.user.username
        });
      } else {
        var newAnnouncement = new Announcement({
          title: req.body.announcementTitle,
          body: req.body.announcementBody,
          expires: false,
          createdByName: req.user.username
        });
      }
      newAnnouncement.save((err) => {
        if (err) {throw err};
        res.redirect('/controlPanel');
      });
    } else {
      res.redirect('/login');
    }
  },
  manageAnnouncements(req, res) {
    var ViewModel = accessControl.navBarSupport(req.user);
    if (accessControl.flightDirectorOrAdmin(req)) {
      ViewModel.announcements = [];
      Announcement.find({}, {}, {}, (err, announcements) => {
        ViewModel.announcements = announcements;
        for (let i=0; i<announcements.length; i++) {
          ViewModel.announcements[i].formattedExpireDate = announcements[i].expireDate.toISOString().substring(0, 10);
        }
        ViewModel.manageAnnouncementsJS = true;
        ViewModel.usesDatePicker = true;
        ViewModel.usesDataTable = true;
        res.render('manageAnnouncements', ViewModel);
      });
    } else {
      res.redirect('/login');
    }
  },
  modifyAnnouncement(req, res) {
    if (accessControl.flightDirectorOrAdmin(req)) {
      if (req.body.selectedAnnouncement) {
        var deleteAnnouncementAllowed = false;
        Announcement.findById(req.body.selectedAnnouncement,
          (err, announcement) => {
            if (err) {console.log(err);}
            if (announcement) {
              switch (req.body.announcementActionSelect) {
                case 'Change title':
                  announcement.title = req.body.announcementTitle;
                  break;
                case 'Change body':
                  announcement.body = req.body.announcementBody;
                  break;
                case 'Change expires':
                  announcement.expires = req.body.expires;
                  break;
                case 'Change expiration date':
                  announcement.expireDate = req.body.expireDate;
                  break;
                case 'Delete announcement':
                  deleteAnnouncementAllowed = true;
                  break;
                default:
                  console.log('Should not get here...');
              }
              if (deleteAnnouncementAllowed) {
                Announcement.deleteOne({_id: req.body.selectedAnnouncement}, function (err) {});
              } else {
                announcement.save((err) => {
                  if (err) {
                    console.log(err);
                  }
                });
              }
              res.redirect('/manageAnnouncements');
            } else {
              res.redirect('/');
            }
          }
        );
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/login');
    }
  }
}
