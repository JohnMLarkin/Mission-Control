const passport = require('passport'),
      express = require('express'),
      router = express.Router(),
      randomString = require('randomatic');

const Organization = require('../models/organization'),
      Mission = require('../models/mission').Mission,
      PodSchema = require('../models/mission').PodSchema,
      podDataTypes = require('../models/mission').podDataTypes,
      accessControl = require('../helpers/accessControl');

module.exports = {
  showCreateOrg(req, res) {
    if (accessControl.onlyAdmin(req)) {
      const ViewModel = {
        user: req.user
      };
      res.render('createOrganization', ViewModel);
    } else {
      res.redirect('/login');
    }
  },
  createOrg(req, res) {
    if (accessControl.onlyAdmin(req)) {
      const ViewModel = {
        user: req.user
      };
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
    const ViewModel = {
      user: req.user,
      organizations: [],
    };
    Organization.find({}, {}, {sort: {name: 1}}, (err, organizations) => {
      if (err) {throw err};
      ViewModel.organizations = organizations;
      res.render('listOrganizations', ViewModel);
    });
  },
  createMission(req, res) {
    if (accessControl.flightDirectorOrAdmin(req)) {
      const ViewModel = {
        user: req.user,
        organizations: []
      };
      Organization.find({}, {}, {sort: {name: 1}}, (err, organizations) => {
        if (err) {throw err};
        ViewModel.organizations = organizations;
        res.render('createMission', ViewModel);
      });
    } else {
      res.redirect('/login');
    }
  },
  addMission(req, res) {
    if (accessControl.flightDirectorOrAdmin(req)) {
      const ViewModel = {
        user: req.user
      };
      Mission.find({}, {}, {sort: {missionID: -1}}, (err, missions) => {
        if (err) {
          console.log('Error on Mission.find query');
          console.log(err);
        }
        console.log(req.body);
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
              launchDate: req.body.predictedLaunchDate
            });
            newMission.save((err, mission) => {
              ViewModel.mission = mission;
              ViewModel.organization = organization;
              ViewModel.formattedLaunchDate = mission.launchDate.toDateString() + ' (tentative)';
              req.session.missionOverviewData = ViewModel;
              res.redirect('/missionOverview');
            });
        });
      });
    } else {
      res.redirect('/login');
    }
  },
  missionOverview(req, res) {
    if (req.session.missionOverviewData) {
      ViewModel = req.session.missionOverviewData;
      req.session.missionOverviewData = null;
    } else {
      console.log('Something else but what?');
    }
    if (!accessControl.flightDirectorOrAdmin(req)) {
      ViewModel.mission.launchCode = null;
    }
    res.render('missionOverview', ViewModel);
  },
  manageMissions(req, res) {
    if (accessControl.onlyAdmin(req)) {
      const ViewModel = {
        user: req.user,
        missions: [],
        organizations: []
      };
      Organization.find({}, {}, {}, (err, organizations) => {
        ViewModel.organizations = organizations;
        orgDict = {};
        for (i=0; i<organizations.length; i++) {
          orgDict[organizations[i]._id] = organizations[i].name;
        }
        Mission.find({}, {}, {sort: {launchDate: -1}}, (err, missions) => {
          ViewModel.missions = missions;
          for (i=0; i<missions.length; i++) {
            ViewModel.missions[i].formattedLaunchDate = missions[i].launchDate.toDateString();
            ViewModel.missions[i].orgName = orgDict[missions[i].organizationID];
          }
          res.render('manageMissions', ViewModel);
        });
      });
    }
  }
}
