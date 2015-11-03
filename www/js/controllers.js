angular.module('arigesinvmov.controllers', [])

.controller('LoginCtrl', ['$rootScope', '$scope', '$state', 'UserFactory', 'Loader',
    function($rootScope, $scope, $state, UserFactory, Loader) {
        $scope.loginData = {
            login: "",
            password: ""
        };

        $scope.load = function() {
            $scope.isUser = UserFactory.isUser();
            $scope.user = UserFactory.getUser();
        }


        $scope.login = function() {
            Loader.showLoading('Buscando usuario..');
            UserFactory.login($scope.loginData).
            success(function(data) {
                Loader.hideLoading();
                if (data) {
                    UserFactory.setUser(data);
                    $scope.load();
                    $state.go('tab.inventario');
                } else {
                    Loader.toggleLoadingWithMessage("Login o password incorrectos");
                    UserFactory.setUser(null);
                    $scope.load();
                }
            }).
            error(function(err, statusCode) {
                Loader.hideLoading();
                if (err) {
                    Loader.toggleLoadingWithMessage(err.message);
                } else {
                    Loader.toggleLoadingWithMessage("Error de conexión. Revise configuración");
                }
            });
        }

        $scope.logout = function() {
            UserFactory.logout();
            $scope.loginData = {
                login: "",
                password: ""
            };
            $scope.user = null;
            $scope.isUser = false;
        }

        $scope.load();
    }
])

.controller('InventarioCtrl', ['$rootScope', '$scope', '$state', 'InventarioFactory', 'Loader', 'UserFactory',
    function($rootScope, $scope, $state, InventarioFactory, Loader, UserFactory) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        // parametrización numeral
        numeral.language('es', {
            delimiters: {
                thousands: '.',
                decimal: ','
            }
        });
        numeral.language('es');

        $scope.$on('$ionicView.enter', function(e) {
            if (!UserFactory.isUser()) {
                Loader.toggleLoadingWithMessage("Debe entrar con un usuario");
                $state.go('tab.login');
            }
        });

        $scope.buscador = {
            ean: ""
        };



        $scope.cleanScope = function() {
            $scope.articulo = null;
            $scope.hayArticulo = false;
            $scope.almacenes = [];
        };

        $scope.getArticulos = function() {
            Loader.showLoading('Buscando artículo..');
            InventarioFactory.getArticulos($scope.buscador).
            success(function(data) {
                Loader.hideLoading();
                if (data) {
                    if (data.length > 0) {
                        data[0].PrecioConIva = numeral(data[0].PrecioConIva).format('#,###,##0.00');
                        $scope.articulo = data[0];
                        $scope.almacenes = data;
                        $rootScope.articulo = $scope.articulo;
                        $rootScope.almacenes = $scope.almacenes;
                        $scope.hayArticulo = true;
                    } else {
                        Loader.toggleLoadingWithMessage("No se ha encontrado artículo con ese codigo");
                        $scope.cleanScope();
                    }
                } else {
                    Loader.toggleLoadingWithMessage("No se ha encontrado artículo con ese codigo");
                    $scope.cleanScope();
                }
            }).
            error(function(err, statusCode) {
                Loader.hideLoading();
                Loader.toggleLoadingWithMessage(err.message);
            });
        };

    }
])

.controller('InventarioDetalleCtrl', ['$rootScope', '$scope', '$stateParams', 'Loader', 'UserFactory', 'InventarioFactory',
    function($rootScope, $scope, $stateParams, Loader, UserFactory, InventarioFactory) {

        $scope.$on('$ionicView.enter', function(e) {
            if (!UserFactory.isUser()) {
                Loader.toggleLoadingWithMessage("Debe entrar con un usuario");
                $state.go('tab.login');
            }
            $scope.articulo = $rootScope.articulo;
            $scope.almacenes = $rootScope.almacenes;
            $scope.datos = {
                cantidad: null
            }
            var codalmac = $stateParams.codalmac;
            for (var i = 0; i < $scope.almacenes.length; i++) {
                var almacen = $scope.almacenes[i];
                if (almacen.CodigoAlmacen == codalmac) {
                    $scope.almacen = almacen;
                }
            }

        });

        $scope.SetInventario = function() {
            var usuario = UserFactory.getUser();
            var data={
                codartic: $scope.almacen.CodigoArticulo,
                codalmac: $scope.almacen.CodigoAlmacen,
                stock: $scope.almacen.Stock,
                cantidad: $scope.datos.cantidad,
                importe: $scope.almacen.PrecioUc,
                codigope: usuario.Codtraba
            };
            Loader.showLoading('Actualizando stock..');
            InventarioFactory.setInventario(data).
            success(function(data) {
                Loader.hideLoading();
                if (data == "*") {
                    Loader.toggleLoadingWithMessage("Stock actualizado correctamente.");
                } else {
                    Loader.toggleLoadingWithMessage(data);
                }
            }).
            error(function(err, statusCode) {
                Loader.hideLoading();
                if (err){
                Loader.toggleLoadingWithMessage(err);
            }else{
                Loader.toggleLoadingWithMessage("Error general. Posiblemente falla conexión.");
            }
            });

        };
    }
])

.controller('ConfigCtrl', ['ConfigFactory', '$rootScope', '$scope', function(ConfigFactory, $rootScope, $scope) {

    var config = ConfigFactory.getConfig();
    if (!config) {
        config = {
            urlApi: ""
        }
    }
    $scope.config = config;
    $scope.setConfig = function() {
        ConfigFactory.setConfig($scope.config);
    }

}]);
