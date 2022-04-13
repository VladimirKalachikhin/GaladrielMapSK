[In English](https://github.com/VladimirKalachikhin/GaladrielMapSK/blob/master/README.md)  
# GaladrielMap SignalK edition[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
Простой картплотер (навигационно-картографическая система), предназначенный для любительского использования на маломерных судах, в домах на колёсах и внедорожных автомобилях вместе с сервером [SignalK](https://signalk.org/).  
Приложение запускается в браузере на телефоне, планшете или другом устройстве -- никакиих приложений устанавливать не нужно.
<div style='float:right;'><a href='https://github.com/VladimirKalachikhin/Galadriel-map/discussions'>Форум</a>
</div>

## v. 0.0 

Это веб-приложение является модификацией картплотера [GaladrielMap](https://vladimirkalachikhin.github.io/Galadriel-map/README.ru-RU) для работы в среде SignalK, и обладает всеми возможностями оригинального приложения, за исключением нижеуказанных. Для ознакомления с возможностями и получения информации обращайтесь к [документации](https://vladimirkalachikhin.github.io/Galadriel-map/README.ru-RU) оригинального приложения.

## Ограничения
* GaladrielMap SignalK edition использует [@signalk/charts-plugin](https://www.npmjs.com/package/@signalk/charts-plugin) для предоставления карт вместо [GaladrielCache](https://github.com/VladimirKalachikhin/Galadriel-cache). Поэтому многие карты, имеющиеся в GaladrielMap недоступны, в частности -- [карта погоды](http://weather.openportguide.de/index.php/en/). Отсутствует также кеширование тайлов из сетевых источников.
* SignalK не имеет средств записи текущего пути, соответственно, возможности управления такой записью недоступны. Однако, как и в оригинальном GaladrielMap имеется возможность показывать записывающийся файл формата .gpx Поэтому если на сервере какая-то программа записывает текущий путь в формате .gpx -- этот файл может динамически отображаться на экране по мере записи.
* SignalK не имеет штатных средств контроля актуальности данных, наподобие тех, что имеются у [gpsdPROXY](https://github.com/VladimirKalachikhin/gpsdPROXY) в GaladrielMap. Поэтому в GaladrielMap SignalK edition добавлены самые базовые средства такого контроля.

## Установка и конфигурирование

Установите веб-приложение в веб-панели SignalK  из Appstore обычным образом как **galadrielmap_sk**.  
Перезапустите сервер SignalK.  
В меню Server -> Plugin Config настройте запуск приложения и необходимые параметры.  
Нажмите Submit для сохранения изменений.

## Использование
В меню Webapps веб-панели SignalK запустите **Galadrielmap_sk**, или откройте _http://your-signalk:3000/galadrielmap_sk/_ в браузере.

## Расширения протокола SignalK
Объект `value` по пути `notifications.mob` кроме указанных в документации свойств содержит также:  

`"source":` UUID экземпляра клиентского приложения, пославшего сигнал,  
`"position":` Объект в формате GeoJSON, содержащий георграфическую информацию о событии.



## Поддержка
[Форум](https://github.com/VladimirKalachikhin/Galadriel-map/discussions)

Форум будет живее, если вы сделаете пожертвование [через PayPal](https://paypal.me/VladimirKalachikhin) по адресу [galadrielmap@gmail.com](mailto:galadrielmap@gmail.com) или на [ЮМани](https://yasobe.ru/na/galadrielmap).

Вы можете получить [индивидуальную платную консультацию](https://kwork.ru/training-consulting/20093293/konsultatsii-po-ustanovke-i-ispolzovaniyu-galadrielmap) по вопросам установки и использования GaladrielMap.


