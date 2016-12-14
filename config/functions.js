module.exports = {
  d1: null,
  d2: null,
  milli: 86400000,
  td: new Date(),

  getProjectDueDate: function(project, edit) {
    var dd = new Date(project.due_date);
    console.log(project.due_date);
    var ddm = dd.getUTCMonth() + 1;
    var ddd = dd.getUTCDate();
    var ddy = dd.getUTCFullYear();
    this.d2 = Date.UTC(ddy, ddm, ddd);
    if (edit === true) {
      if (ddd < 10) {
        ddd = "0" + ddd;
      }

      if (ddm < 10) {
        ddm = "0" + ddm;
      }
      return ddy + "-" +  ddm + "-" + ddd;
    } else {
      return ddm + "/" + ddd + "/" + ddy;
    }
  },

  getDaysUntil: function() {
    this.d1 = Date.UTC(this.td.getFullYear(), this.td.getMonth(), this.td.getDate());
    return Math.floor(((this.d2 - this.d1)/this.milli) - 30);
  },

  autoGenerateTracking: function(length, projects) {
    console.log("auto projects: ");
    console.log(projects);
    var letter = '';
    if (length > 0) {
      var last = projects[projects.length - 1];
      var daaate = new Date(last.createdAt);
      var d_add = Date.UTC(daaate.getFullYear(), daaate.getMonth(), daaate.getDate());
      var d_diff = Math.floor((this.d1 - d_add)/this.milli);

      if (d_diff === 0) {
        function nextChar(c) {
          return String.fromCharCode(c.charCodeAt(0) + 1);
        }

        letter = nextChar(last.tracking.charAt(last.tracking.length - 1));
      }
    } else {
      letter = 'A';
    }
    return 'HBR' + (this.td.getUTCMonth() + 1) + this.td.getUTCDate() + this.td.getUTCFullYear() + letter;
  },

  archived: function(project) {
    return project.archived ? project : null;
  },

  current: function(project) {
    return project.archived ? null : project;
  },

  filtered: function(projects) {
    return projects.filter(archived)
  },

  confirmPasswords: function(pass, conf) {
    if (pass !== conf) {
      confirm_password.setCustomValidity("Passwords Don't Match");
      return false;
    } else {
      return true;
    }
  }
}
