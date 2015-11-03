angular.module('arigesinvmov.services', [])

.factory('Loader', ['$ionicLoading', '$timeout', function($ionicLoading, $timeout) {

    var LOADERAPI = {

        showLoading: function(text) {
            text = text || 'Cargando...';
            $ionicLoading.show({
                template: text
            });
        },

        hideLoading: function() {
            $ionicLoading.hide();
        },

        toggleLoadingWithMessage: function(text, timeout) {
            var self = this;

            self.showLoading(text);

            $timeout(function() {
                self.hideLoading();
            }, timeout || 3000);
        }

    };
    return LOADERAPI;
}])

.factory('LSFactory', [function() {

    var LSAPI = {

        clear: function() {
            return localStorage.clear();
        },

        get: function(key) {
            return JSON.parse(localStorage.getItem(key));
        },

        set: function(key, data) {
            return localStorage.setItem(key, JSON.stringify(data));
        },

        delete: function(key) {
            return localStorage.removeItem(key);
        },

        getAll: function() {
            var books = [];
            var items = Object.keys(localStorage);

            for (var i = 0; i < items.length; i++) {
                if (items[i] !== 'user' || items[i] != 'token') {
                    books.push(JSON.parse(localStorage[items[i]]));
                }
            }

            return books;
        }

    };

    return LSAPI;

}])

.factory('ConfigFactory', ['LSFactory', function(LSFactory) {
    var configKey = "config";

    var CONFIGAPI = {
        isConfig: function() {
            return this.getConfig() === null ? false : true;
        },
        getConfig: function() {
            return LSFactory.get(configKey);
        },
        setConfig: function(config) {
            return LSFactory.set(configKey, config);
        }
    };
    return CONFIGAPI;
}])


.factory('UserFactory', ['$http', 'LSFactory', 'ConfigFactory', 'Loader',
    function($http, LSFactory, ConfigFactory, Loader) {
        var userKey = "user";

        var UserAPI = {
            login: function(login) {
                return $http.post(ConfigFactory.getConfig().urlApi + '/api/login/GetLogin', login);
            },
            isUser: function() {
                return this.getUser() === null ? false : true;
            },
            getUser: function() {
                return LSFactory.get(userKey);
            },
            setUser: function(user) {
                return LSFactory.set(userKey, user);
            },
            logout: function() {
                LSFactory.set(userKey, null);
                return null;
            }

        };
        return UserAPI;
    }
])

.factory('InventarioFactory', ['ConfigFactory','$http', function(ConfigFactory, $http) {
    var InventarioAPI = {
        getArticulo: function(ean) {
            return $http.post(ConfigFactory.getConfig().urlApi + '/api/inventario/GetArticuloEan', ean);
        },
        getArticulos: function(ean) {
            return $http.post(ConfigFactory.getConfig().urlApi + '/api/inventario/GetArticulosEan', ean);
        },
        setInventario: function(data) {
            return $http.post(ConfigFactory.getConfig().urlApi + '/api/inventario/SetInventario', data);
        }
    };
    return InventarioAPI;
}])
