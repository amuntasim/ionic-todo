var db = null;
var app = angular.module('i-todo', ['ionic', 'todo.services', 'ngCordova']);

app.run(function ($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    if (window.cordova) {
      db = $cordovaSQLite.openDB({name: "todo.db"}); //device
    } else {
      db = window.openDatabase("todo.db", '1', 'my', 1024 * 1024 * 100); // browser
    }
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tasks (id integer primary key, title text, description text, completed integer DEFAULT 0)");
  });
});

app.controller('task', function ($scope, $ionicModal, $ionicPopup, $ionicPopover, Task, $filter) {
  $scope.data = {
    showDelete: false
  };
  $scope.tasks = [];
  $scope.search = '';
  $scope.task = {};
  $scope.fTask = {};
  $scope.taskStatus = '';

  $ionicModal.fromTemplateUrl('task-form-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.taskFormModal = modal;
  });

  $ionicModal.fromTemplateUrl('task-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.taskModal = modal;
  });

  $scope.getTasks = function () {
    Task.all().then(function (tasks) {
      $scope.tasks = tasks;
    });
  };

  $scope.createTask = function () {
    Task.add($scope.fTask);
    $scope.getTasks();
    $scope.taskFormModal.hide();
    $scope.fTask = {};
  };

  $scope.confirmRemove = function (taskId, closeModal) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Remove task',
      template: 'Are you sure you want to delete this task?'
    });

    confirmPopup.then(function (res) {
      if (res) {
        $scope.removeTask(taskId, closeModal);
      }
    });
  };

  $scope.removeTask = function (taskId, closeModal) {
    Task.remove(taskId).then(function (task) {
      $scope.getTasks();
      if (closeModal) {
        $scope.closeTaskModal();
      }
    });
  };

  $scope.editTask = function (taskId) {
    Task.get(taskId).then(function (task) {
      $scope.fTask = task;
      $scope.modalTitle = 'Edit Task';
      $scope.modalButton = 'Update Task';
      $scope.taskFormModal.show();
    });
  };

  $scope.updateTask = function (taskId) {
    Task.update(taskId, $scope.fTask).then(function (task) {
      $scope.fTask = task;
      $scope.getTasks();
      $scope.taskFormModal.hide();
      $scope.fTask = {};
    });
  };

  $scope.completeTask = function (taskId) {
    Task.update(taskId, $scope.task).then(function (task) {
      Task.get(taskId).then(function (task) {
        $scope.task = task;
      });
    });
  };

  $scope.openTaskFormModal = function () {
    $scope.modalTitle = 'Create Task';
    $scope.modalButton = 'Save Task';
    $scope.taskFormModal.show();
  };

  $scope.showTaskModal = function (taskId) {
    Task.get(taskId).then(function (task) {
      $scope.task = task;
      $scope.taskModal.show();
    });
  };

  $scope.closeTaskFormModal = function () {
    $scope.taskFormModal.hide();
  };

  $scope.closeTaskModal = function () {
    $scope.taskModal.hide();
  };

  // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('filter-popover.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function ($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function () {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.popover.remove();
  });

  $scope.filterTasks = function (query, options) {
    Task.all(options).then(function (tasks) {
      if (query) {
        $scope.tasks = $filter('searchTask')(tasks, query);
      } else {
        $scope.tasks = tasks;
      }
    });


  };
});

app.filter('searchTask', function () {
  return function (items, query) {
    var filtered = [];
    var letterMatch = new RegExp(query, 'i');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (query) {
        if (letterMatch.test(item.title)) {
          filtered.push(item);
        }
      } else {
        filtered.push(item);
      }
    }
    return filtered;
  };
});

