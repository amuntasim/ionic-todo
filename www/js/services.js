angular.module('todo.services', [])
  .factory('DBA', function ($cordovaSQLite, $q, $ionicPlatform) {
    var self = this;
    self.query = function (query, parameters) {
      parameters = parameters || [];
      var q = $q.defer();

      $ionicPlatform.ready(function () {
        $cordovaSQLite.execute(db, query, parameters)
          .then(function (result) {
            q.resolve(result);
          }, function (error) {
            console.warn(error);
            q.reject(error);
          });
      });
      return q.promise;
    }

    self.getAll = function (result) {
      var output = [];

      for (var i = 0; i < result.rows.length; i++) {
        output.push(result.rows.item(i));
      }
      return output;
    }

    self.getById = function (result) {
      var output = null;
      output = angular.copy(result.rows.item(0));
      return output;
    }
    return self;
  })

  .factory('Task', function ($cordovaSQLite, DBA) {
    var self = this;

    self.all = function (options) {
      var query = "SELECT * FROM tasks ";
      var parameters = []
      if (options && options.completed == 0) {
        query += " where completed != 1 "
      } else if (options && options.completed == 1) {
        query += " where completed = 1"
      }
      query += " ORDER BY completed ASC, id DESC";

      return DBA.query(query, parameters)
        .then(function (result) {
          return DBA.getAll(result);
        });
    }

    self.get = function (taskId) {
      var parameters = [taskId];
      return DBA.query("SELECT * FROM tasks WHERE id = (?)", parameters)
        .then(function (result) {
          return DBA.getById(result);
        });
    }

    self.add = function (task) {
      var parameters = [task.title, task.description || null, task.completed || 0];
      return DBA.query("INSERT INTO tasks (title, description, completed) VALUES (?,?,?)", parameters);
    }

    self.remove = function (taskId) {
      var parameters = [taskId];
      return DBA.query("DELETE FROM tasks WHERE id = (?)", parameters);
    }

    self.update = function (taskId, task) {
      var parameters = [task.title, task.description || null, task.completed || 0, taskId];
      return DBA.query("UPDATE tasks SET title = (?), description = (?) , completed = (?) WHERE id = (?)", parameters);
    }

    return self;
  })
