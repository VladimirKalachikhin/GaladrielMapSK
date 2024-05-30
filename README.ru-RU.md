[In English](README.md)  
# GaladrielMap SignalK edition [![License: CC BY-NC-SA 4.0](Cc-by-nc-sa_icon.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ru)
Простой картплотер (электронно-картографическая система, ЭКС), предназначенный для любительского использования на маломерных судах, в домах на колёсах и внедорожных автомобилях вместе с сервером [SignalK](https://signalk.org/).  
Приложение запускается в браузере на телефоне, планшете или другом устройстве -- никакиих приложений устанавливать не нужно.
<div style='float:right;'><a href='https://github.com/VladimirKalachikhin/Galadriel-map/discussions'>Форум</a>
</div>

## v. 0.9

Это веб-приложение является модификацией картплотера [GaladrielMap](https://vladimirkalachikhin.github.io/Galadriel-map/README.ru-RU) для работы в среде SignalK, и обладает всеми возможностями оригинального приложения, за исключением нижеуказанных. Для ознакомления с возможностями и получения информации обращайтесь к [документации](https://vladimirkalachikhin.github.io/Galadriel-map/README.ru-RU) оригинального приложения.

## Ограничения
* GaladrielMap SignalK edition использует [@signalk/charts-plugin](https://www.npmjs.com/package/@signalk/charts-plugin) для предоставления карт вместо [GaladrielCache](https://github.com/VladimirKalachikhin/Galadriel-cache). Поэтому многие карты, имеющиеся в GaladrielMap недоступны, в частности -- [карта погоды](http://weather.openportguide.de/index.php/en/). Отсутствует также кеширование тайлов из сетевых источников.
* SignalK не имеет штатных средств контроля актуальности данных, наподобие тех, что имеются у [gpsdPROXY](https://github.com/VladimirKalachikhin/gpsdPROXY) в GaladrielMap. Поэтому в GaladrielMap SignalK edition добавлены самые базовые средства такого контроля. Текущее время запаздывания данных отображается в верхнем левом углу вкладки "Скорость и направление".  
* Из-за особенностей организации SignalK в редакторе маршрутов нельзя сохранить на сервере файл .gpx размером больше 4Кб.

## Возможности
GaladrielMap SignalK edition поддерживает систему оповещений SignalK, поэтому, если установлен плагин [collision-detector](https://www.npmjs.com/package/collision-detector), GaladrielMap SignalK edition  обозначает потенциально опасные суда значком на карте, и одновременно рисует стрелку в направлении опасности внутри значка, указывающего собственное положение.  
Если установлен плагин [naivegpxlogger](https://www.npmjs.com/package/naivegpxlogger), можно вести запись пути в формате gpx. 

## Установка и конфигурирование

Установите веб-приложение с помощью веб-панели SignalK из Appstore обычным образом как **galadrielmap_sk**.  
Перезапустите сервер SignalK.  
В меню Server -> Plugin Config настройте запуск приложения и необходимые параметры.  
Нажмите Submit для сохранения изменений.

## Использование
В меню Webapps веб-панели SignalK запустите **Galadrielmap_sk**, или откройте _http://your-signalk:3000/galadrielmap_sk/_ в браузере.

### Запись пути
Установите [naiveGPXlogger](https://www.npmjs.com/package/naivegpxlogger) для записи текущего пути. naiveGPXlogger управляется из интерфейса GaladrielMap.
В любом случае имеется возможность показывать любой записывающийся файл формата .gpx Поэтому если на сервере какая-то программа записывает текущий путь в формате .gpx -- этот файл может динамически отображаться на экране по мере записи. Для этого нужно указать в настройках GaladrielMap каталог, куда записывается файл.


## Расширения протокола SignalK
Объект `value` по пути `notifications.mob` кроме указанных в документации свойств содержит также:  

`"source":` UUID экземпляра клиентского приложения, пославшего сигнал,  
`"position":` Объект в формате GeoJSON, содержащий географическую информацию о событии.



## Поддержка
[Форум](https://github.com/VladimirKalachikhin/Galadriel-map/discussions)

Форум будет живее, если вы сделаете пожертвование на [ЮМани](https://sobe.ru/na/galadrielmap).

Вы можете получить [индивидуальную платную консультацию](https://kwork.ru/training-consulting/20093293/konsultatsii-po-ustanovke-i-ispolzovaniyu-galadrielmap) по вопросам установки и использования GaladrielMap.


