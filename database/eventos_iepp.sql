-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-08-2026 a las 10:13:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `eventos_iepp`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `participante_id` bigint(20) UNSIGNED NOT NULL,
  `personal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` enum('ACTIVA','ANULADA') NOT NULL DEFAULT 'ACTIVA',
  `observacion` varchar(500) DEFAULT NULL,
  `motivo_anulacion` varchar(500) DEFAULT NULL,
  `fecha_anulacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asistencias`
--

INSERT INTO `asistencias` (`id`, `participante_id`, `personal_id`, `fecha`, `hora`, `estado`, `observacion`, `motivo_anulacion`, `fecha_anulacion`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, '2026-08-01', '19:59:29', 'ACTIVA', NULL, NULL, NULL, '2026-08-01 19:59:29', '2026-08-01 19:59:29'),
(2, 4, NULL, '2026-08-01', '21:20:35', 'ACTIVA', NULL, NULL, NULL, '2026-08-01 21:20:35', '2026-08-01 21:20:35'),
(3, 2, NULL, '2026-08-02', '00:43:54', 'ACTIVA', NULL, NULL, NULL, '2026-08-02 00:43:54', '2026-08-02 00:43:54'),
(4, 6, NULL, '2026-08-02', '00:56:47', 'ACTIVA', NULL, NULL, NULL, '2026-08-02 00:56:47', '2026-08-02 00:56:47'),
(5, 3, 1, '2026-08-02', '02:52:46', 'ACTIVA', NULL, NULL, NULL, '2026-08-02 02:52:46', '2026-08-02 02:52:46'),
(6, 7, 1, '2026-08-02', '03:07:53', 'ACTIVA', NULL, NULL, NULL, '2026-08-02 03:07:53', '2026-08-02 03:07:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `canjes_colaborador`
--

CREATE TABLE `canjes_colaborador` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `codigo_colaborador_id` bigint(20) UNSIGNED NOT NULL,
  `colaborador_id` bigint(20) UNSIGNED NOT NULL,
  `puesto_id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `saldo_anterior` int(10) UNSIGNED NOT NULL,
  `saldo_posterior` int(10) UNSIGNED NOT NULL,
  `estado` enum('CANJEADO','ANULADO') NOT NULL DEFAULT 'CANJEADO',
  `motivo_anulacion` varchar(500) DEFAULT NULL,
  `fecha_anulacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `canjes_colaborador`
--

INSERT INTO `canjes_colaborador` (`id`, `codigo_colaborador_id`, `colaborador_id`, `puesto_id`, `fecha`, `hora`, `saldo_anterior`, `saldo_posterior`, `estado`, `motivo_anulacion`, `fecha_anulacion`, `created_at`) VALUES
(1, 1, 1, 1, '2026-08-01', '22:08:43', 2, 1, 'CANJEADO', NULL, NULL, '2026-08-01 22:08:43'),
(2, 2, 2, 3, '2026-08-02', '01:06:55', 2, 1, 'CANJEADO', NULL, NULL, '2026-08-02 01:06:55'),
(3, 3, 3, 3, '2026-08-02', '03:10:02', 1, 0, 'CANJEADO', NULL, NULL, '2026-08-02 03:10:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargos`
--

CREATE TABLE `cargos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `es_otro` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cargos`
--

INSERT INTO `cargos` (`id`, `nombre`, `es_otro`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'Coordinador Regional', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(2, 'Secretario Regional', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(3, 'Tesorero Regional', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(4, 'Vocal Regional', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(5, 'Colaborador (a) Regional', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(6, 'Coordinador Local', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(7, 'Secretario Local', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(8, 'Tesorero Local', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(9, 'Vocal Local', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(10, 'Colaborador (a) Local', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(11, 'Pastor (a)', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(12, 'Ministro (a)', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(13, 'Presbítero', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(14, 'Participante o miembro', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(15, 'OTRO', 1, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigos_colaborador`
--

CREATE TABLE `codigos_colaborador` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `colaborador_id` bigint(20) UNSIGNED NOT NULL,
  `codigo` char(6) NOT NULL,
  `fecha` date NOT NULL,
  `fecha_hora_generacion` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('DISPONIBLE','UTILIZADO','VENCIDO','ANULADO') NOT NULL DEFAULT 'DISPONIBLE',
  `fecha_hora_uso` datetime DEFAULT NULL,
  `fecha_hora_anulacion` datetime DEFAULT NULL,
  `motivo_anulacion` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `codigos_colaborador`
--

INSERT INTO `codigos_colaborador` (`id`, `colaborador_id`, `codigo`, `fecha`, `fecha_hora_generacion`, `estado`, `fecha_hora_uso`, `fecha_hora_anulacion`, `motivo_anulacion`) VALUES
(1, 1, 'C33538', '2026-08-01', '2026-08-01 21:58:28', 'UTILIZADO', '2026-08-01 22:08:43', NULL, NULL),
(2, 2, 'D67608', '2026-08-02', '2026-08-02 01:06:48', 'UTILIZADO', '2026-08-02 01:06:55', NULL, NULL),
(3, 3, 'U97240', '2026-08-02', '2026-08-02 03:09:53', 'UTILIZADO', '2026-08-02 03:10:02', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaboradores`
--

CREATE TABLE `colaboradores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombres` varchar(120) NOT NULL,
  `apellidos` varchar(180) NOT NULL,
  `celular` char(9) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password_referencia` varchar(100) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `colaboradores`
--

INSERT INTO `colaboradores` (`id`, `nombres`, `apellidos`, `celular`, `password_hash`, `password_referencia`, `estado`, `ultimo_acceso`, `created_at`, `updated_at`) VALUES
(1, 'JUAN', 'TAIPE', '987654321', '$2b$12$b3V2cZC334043HjD/39tLe3w5OE//qyMwXLikNbEUPHC.LQlPsdda', 'colaborador1', 'ACTIVO', '2026-08-01 21:58:11', '2026-08-01 21:57:52', '2026-08-01 21:58:11'),
(2, 'SAMANTA', 'TORRES', '987654322', '$2b$12$xBH6TB6G95Va7q5gzSnCmeN.RsvAeUG4Y4QpMhDAmQ0Wn03Zgxp6G', 'COLABORADOR2', 'ACTIVO', '2026-08-02 01:06:34', '2026-08-02 01:06:15', '2026-08-02 01:06:34'),
(3, 'ANA', 'ZORRILA', '987654323', '$2b$12$gKNv7cvf2YBQEz.TrWFoLOhEVtETOYpuHv/TbkXIPUeS3pYep8w96', 'COLABORADOR', 'ACTIVO', '2026-08-02 03:09:50', '2026-08-02 03:09:24', '2026-08-02 03:09:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `confirmaciones_participante`
--

CREATE TABLE `confirmaciones_participante` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `participante_id` bigint(20) UNSIGNED NOT NULL,
  `respuesta` enum('CONFIRMADO','NO_ASISTIRA','PENDIENTE') NOT NULL,
  `medio` enum('WEB','OPERADOR','WHATSAPP','TELEFONO') NOT NULL DEFAULT 'WEB',
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `observacion` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consumos_participantes`
--

CREATE TABLE `consumos_participantes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `participante_id` bigint(20) UNSIGNED NOT NULL,
  `personal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `asistencia_id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `tipo_alimento` enum('DESAYUNO','CENA') NOT NULL,
  `hora` time NOT NULL,
  `estado` enum('ENTREGADO','ANULADO') NOT NULL DEFAULT 'ENTREGADO',
  `motivo_anulacion` varchar(500) DEFAULT NULL,
  `fecha_anulacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `consumos_participantes`
--

INSERT INTO `consumos_participantes` (`id`, `participante_id`, `personal_id`, `asistencia_id`, `fecha`, `tipo_alimento`, `hora`, `estado`, `motivo_anulacion`, `fecha_anulacion`, `created_at`, `updated_at`) VALUES
(1, 4, NULL, 2, '2026-08-01', 'DESAYUNO', '21:20:57', 'ENTREGADO', NULL, NULL, '2026-08-01 21:20:57', '2026-08-01 21:20:57'),
(3, 2, NULL, 3, '2026-08-02', 'DESAYUNO', '00:44:14', 'ENTREGADO', NULL, NULL, '2026-08-02 00:44:14', '2026-08-02 00:44:14'),
(6, 6, NULL, 4, '2026-08-02', 'DESAYUNO', '01:03:15', 'ENTREGADO', NULL, NULL, '2026-08-02 01:03:15', '2026-08-02 01:03:15'),
(7, 2, NULL, 3, '2026-08-02', 'CENA', '01:03:27', 'ENTREGADO', NULL, NULL, '2026-08-02 01:03:27', '2026-08-02 01:03:27'),
(8, 6, NULL, 4, '2026-08-02', 'CENA', '01:03:41', 'ENTREGADO', NULL, NULL, '2026-08-02 01:03:41', '2026-08-02 01:03:41'),
(9, 7, 1, 6, '2026-08-02', 'DESAYUNO', '03:07:58', 'ENTREGADO', NULL, NULL, '2026-08-02 03:07:58', '2026-08-02 03:07:58'),
(10, 7, 1, 6, '2026-08-02', 'CENA', '03:08:10', 'ENTREGADO', NULL, NULL, '2026-08-02 03:08:10', '2026-08-02 03:08:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_puesto`
--

CREATE TABLE `movimientos_puesto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `puesto_id` bigint(20) UNSIGNED NOT NULL,
  `tipo` enum('ASIGNACION_INICIAL','CANJE','REPOSICION','AJUSTE_POSITIVO','AJUSTE_NEGATIVO','ANULACION') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `saldo_anterior` int(11) NOT NULL,
  `saldo_posterior` int(11) NOT NULL,
  `canje_id` bigint(20) UNSIGNED DEFAULT NULL,
  `motivo` varchar(500) DEFAULT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `movimientos_puesto`
--

INSERT INTO `movimientos_puesto` (`id`, `puesto_id`, `tipo`, `cantidad`, `saldo_anterior`, `saldo_posterior`, `canje_id`, `motivo`, `fecha_hora`) VALUES
(1, 1, 'CANJE', -1, 2, 1, 1, NULL, '2026-08-01 22:08:43'),
(2, 3, 'CANJE', -1, 2, 1, 2, NULL, '2026-08-02 01:06:55'),
(3, 3, 'CANJE', -1, 1, 0, 3, NULL, '2026-08-02 03:10:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participantes`
--

CREATE TABLE `participantes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `dni` char(8) NOT NULL,
  `nombres` varchar(120) NOT NULL,
  `apellidos` varchar(180) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `sexo` enum('MASCULINO','FEMENINO') NOT NULL,
  `celular` char(9) NOT NULL,
  `region_id` int(10) UNSIGNED DEFAULT NULL,
  `iglesia_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cargo_id` bigint(20) UNSIGNED NOT NULL,
  `region_manual` varchar(150) DEFAULT NULL,
  `iglesia_manual` varchar(200) DEFAULT NULL,
  `cargo_manual` varchar(100) DEFAULT NULL,
  `acepta_reglamento` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_aceptacion_reglamento` datetime DEFAULT NULL,
  `estado` enum('REGISTRADO','CONFIRMADO','ASISTIO','ANULADO') NOT NULL DEFAULT 'REGISTRADO',
  `motivo_anulacion` varchar(500) DEFAULT NULL,
  `fecha_anulacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `participantes`
--

INSERT INTO `participantes` (`id`, `dni`, `nombres`, `apellidos`, `fecha_nacimiento`, `sexo`, `celular`, `region_id`, `iglesia_id`, `cargo_id`, `region_manual`, `iglesia_manual`, `cargo_manual`, `acepta_reglamento`, `fecha_aceptacion_reglamento`, `estado`, `motivo_anulacion`, `fecha_anulacion`, `created_at`, `updated_at`) VALUES
(1, '72267787', 'ARTURO DIEGO', 'CANDIOTTI HUAMAN', '2002-12-02', 'MASCULINO', '987654321', 13, 37, 8, NULL, NULL, NULL, 1, '2026-08-01 19:57:54', 'ASISTIO', NULL, NULL, '2026-08-01 19:57:54', '2026-08-01 19:59:29'),
(2, '72267786', 'ESTEFANY JANYNA', 'TAIPE TORRES', '2002-08-20', 'FEMENINO', '987654321', 18, NULL, 9, 'HUANCAVELICA', 'MATRIX', NULL, 1, '2026-08-01 20:02:08', 'ASISTIO', NULL, NULL, '2026-08-01 20:02:08', '2026-08-02 00:43:54'),
(3, '72267785', 'BERTHA', 'QUISPE HUACHO', '2005-02-04', 'FEMENINO', '950553005', 14, 38, 9, NULL, NULL, NULL, 1, '2026-08-01 20:07:39', 'ASISTIO', NULL, NULL, '2026-08-01 20:07:39', '2026-08-02 02:52:46'),
(4, '79955281', 'LIAN KENT', 'MENDOZA INCHUÑA', '2004-12-20', 'MASCULINO', '987654321', 3, 10, 10, NULL, NULL, NULL, 1, '2026-08-01 21:17:52', 'ASISTIO', NULL, NULL, '2026-08-01 21:17:52', '2026-08-01 21:20:35'),
(5, '72267781', 'DINA', 'CATUMA MARCAÑAUPA', '2026-06-25', 'MASCULINO', '989785623', 17, 43, 9, NULL, NULL, NULL, 1, '2026-08-01 22:11:07', 'REGISTRADO', NULL, NULL, '2026-08-01 22:11:07', '2026-08-01 22:11:07'),
(6, '72267782', 'EDY HAYDEE', 'QUISPE HUACHO', '2000-05-21', 'FEMENINO', '989785627', 17, 43, 4, NULL, NULL, NULL, 1, '2026-08-02 00:16:24', 'ASISTIO', NULL, NULL, '2026-08-02 00:16:24', '2026-08-02 00:56:47'),
(7, '72267788', 'VERONICA', 'HUARCAYA UNOCC', '2000-02-05', 'FEMENINO', '989785627', 17, 43, 3, NULL, NULL, NULL, 1, '2026-08-02 03:07:33', 'ASISTIO', NULL, NULL, '2026-08-02 03:07:33', '2026-08-02 03:07:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_operativo`
--

CREATE TABLE `personal_operativo` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombres` varchar(150) NOT NULL,
  `apellidos` varchar(200) NOT NULL,
  `celular` char(9) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password_referencia` varchar(100) DEFAULT NULL,
  `funcion` enum('ASISTENCIA','DESAYUNO','CENA') NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `personal_operativo`
--

INSERT INTO `personal_operativo` (`id`, `nombres`, `apellidos`, `celular`, `password_hash`, `password_referencia`, `funcion`, `estado`, `ultimo_acceso`, `created_at`, `updated_at`) VALUES
(1, 'SANDRA', 'MARCAS', '987654320', '$2b$12$MKOog592PQNBLNCwJNtZNeR4xj2Adbzs5.Sy6CppNiFgMMraS1JKi', 'PERSONAL', 'ASISTENCIA', 'ACTIVO', '2026-08-02 02:59:13', '2026-08-02 02:51:51', '2026-08-02 02:59:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puestos_comida`
--

CREATE TABLE `puestos_comida` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_puesto` varchar(20) NOT NULL,
  `encargado` varchar(200) NOT NULL,
  `celular` char(9) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password_referencia` varchar(100) DEFAULT NULL,
  `platos_asignados` int(10) UNSIGNED NOT NULL DEFAULT 2,
  `platos_entregados` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `platos_disponibles` int(10) UNSIGNED NOT NULL DEFAULT 2,
  `estado` enum('ACTIVO','INACTIVO','SIN_DISPONIBILIDAD') NOT NULL DEFAULT 'ACTIVO',
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `puestos_comida`
--

INSERT INTO `puestos_comida` (`id`, `numero_puesto`, `encargado`, `celular`, `password_hash`, `password_referencia`, `platos_asignados`, `platos_entregados`, `platos_disponibles`, `estado`, `ultimo_acceso`, `created_at`, `updated_at`) VALUES
(1, '1', 'ESTEFANY', '987654322', '$2b$12$7ah7SdKgNGYqvB0rnaKvLOnRK7So4qRb1hv8Zyv/6ivCLTAzD1SNO', 'puesto1', 2, 1, 1, 'ACTIVO', '2026-08-01 22:01:08', '2026-08-01 20:59:13', '2026-08-01 22:08:43'),
(2, 'B2', 'LUIS', '987654321', '$2b$12$QFx0moxKUqfk2hDig1cdge9Lq1OmUIyzCb1oR4LnShF6pQoqSBElq', 'puesto2', 2, 0, 2, 'ACTIVO', '2026-08-01 21:25:54', '2026-08-01 21:25:23', '2026-08-01 21:25:54'),
(3, 'B3', 'ALEX', '987654321', '$2b$12$XJEbGqZIAYbELkrG2eWYz.P3tOXlhgdHVy.A.MItDnUtNHUTXYekK', 'PUESTO3', 2, 2, 0, 'SIN_DISPONIBILIDAD', '2026-08-02 01:04:48', '2026-08-02 01:04:19', '2026-08-02 03:10:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regiones`
--

CREATE TABLE `regiones` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `regiones`
--

INSERT INTO `regiones` (`id`, `nombre`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'AMAZONAS', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(2, 'ANCASH', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(3, 'APURIMAC', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(4, 'AYACUCHO', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(5, 'CAJAMARCA', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(6, 'CUSCO', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(7, 'ECUADOR', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(8, 'HUANUCO', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(9, 'JUNIN', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(10, 'LA LIBERTAD', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(11, 'LAMBAYEQUE', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(12, 'LIMA', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(13, 'MADRE DE DIOS', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(14, 'PASCO', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(15, 'SAN MARTIN', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(16, 'SUR', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(17, 'UCAYALI', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(18, 'OTROS', 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regiones_eclesiales`
--

CREATE TABLE `regiones_eclesiales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `region_id` int(10) UNSIGNED NOT NULL,
  `codigo` varchar(30) DEFAULT NULL,
  `region_geografica` varchar(100) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `es_otros` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `regiones_eclesiales`
--

INSERT INTO `regiones_eclesiales` (`id`, `region_id`, `codigo`, `region_geografica`, `nombre`, `es_otros`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 'RE001', 'AMAZONAS', 'AMAZONAS I - BAGUA GRANDE', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(2, 1, 'RE002', 'AMAZONAS', 'AMAZONAS II - CHACHAPOYAS', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(3, 2, 'RE003', 'ANCASH', 'ANCASH I - HUARAZ', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(4, 2, 'RE004', 'ANCASH', 'ANCASH II - SAN LUIS', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(5, 3, 'RE005', 'APURIMAC', 'APURIMAC I - URIPA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(6, 3, 'RE006', 'APURIMAC', 'APURIMAC II - OCOBAMBA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(7, 3, 'RE007', 'APURIMAC', 'APURIMAC III - CASCABAMBA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(8, 3, 'RE008', 'APURIMAC', 'APURIMAC IV - COTABAMBAS', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(9, 3, 'RE009', 'APURIMAC', 'APURIMAC VI - ROCCHAC', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(10, 3, 'RE010', 'APURIMAC', 'APURIMAC VII - RANRACANCHA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(11, 3, 'RE011', 'APURIMAC', 'APURIMAC VIII - ANDAHUAYLAS', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(12, 3, 'RE012', 'APURIMAC', 'APURIMAC IX - CHACÑA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(13, 4, 'RE013', 'AYACUCHO', 'AYACUCHO I - HUAMANGA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(14, 4, 'RE014', 'AYACUCHO', 'AYACUCHO II - SAN FRANCISCO', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(15, 4, 'RE015', 'AYACUCHO', 'AYACUCHO III - LOBO TAHUANTINSUYO', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(16, 4, 'RE016', 'AYACUCHO', 'AYACUCHO IV - VILLA VIRGEN', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(17, 4, 'RE017', 'AYACUCHO', 'AYACUCHO V - SAN MIGUEL (VISTA ALEGRE)', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(18, 4, 'RE018', 'AYACUCHO', 'AYACUCHO VI - TUTUMBARU', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(19, 4, 'RE019', 'AYACUCHO', 'AYACUCHO VII - PACOBAMBA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(20, 4, 'RE020', 'AYACUCHO', 'AYACUCHO VIII - CHUSCHI', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(21, 4, 'RE021', 'AYACUCHO', 'AYACUCHO X - HUANTA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(22, 4, 'RE022', 'AYACUCHO', 'AYACUCHO XI - VILCASHUAMAN', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(23, 5, 'RE023', 'CAJAMARCA', 'CAJAMARCA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(24, 6, 'RE024', 'CUSCO', 'CUSCO I - SANTA TERESA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(25, 7, 'RE025', 'ECUADOR', 'ECUADOR - HUAQUILLAS', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(26, 8, 'RE026', 'HUANUCO', 'HUANUCO I - PORVENIR LIBERTAD', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(27, 8, 'RE027', 'HUANUCO', 'HUANUCO III - COLQUILLAS', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(28, 8, 'RE028', 'HUANUCO', 'HUANUCO IV - MONZON', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(29, 8, 'RE029', 'HUANUCO', 'HUANUCO V - DOS DE MAYO', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(30, 8, 'RE030', 'HUANUCO', 'HUANUCO VI - HUANUCO CIUDAD', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(31, 9, 'RE031', 'JUNIN', 'JUNIN I - VILLA RICA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(32, 9, 'RE032', 'JUNIN', 'JUNIN II - HUANCAYO', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(33, 9, 'RE033', 'JUNIN', 'JUNIN III - MICAELA BASTIDAS', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(34, 10, 'RE034', 'LA LIBERTAD', 'LA LIBERTAD - TRUJILLO', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(35, 11, 'RE035', 'LAMBAYEQUE', 'LAMBAYEQUE - CHICLAYO', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(36, 12, 'RE036', 'LIMA', 'LIMA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(37, 13, 'RE037', 'MADRE DE DIOS', 'MADRE DE DIOS - PUERTO MALDONADO', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(38, 14, 'RE038', 'PASCO', 'PASCO - TICLACAYAN', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(39, 15, 'RE039', 'SAN MARTIN', 'SAN MARTIN I - MOYOBAMBA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(40, 15, 'RE040', 'SAN MARTIN', 'SAN MARTIN II - TOCACHE', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(41, 16, 'RE041', 'SUR', 'SUR GRANDE - AREQUIPA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(42, 16, 'RE042', 'SUR', 'SUR MEDIO - ICA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(43, 17, 'RE043', 'UCAYALI', 'UCAYALI - PUCALLPA', 0, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03'),
(44, 18, 'OTROS', 'OTROS', 'OTROS', 1, 'ACTIVO', '2026-08-01 16:40:03', '2026-08-01 16:40:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `perfil` enum('ADMIN_REPORTES','ADMIN_GENERAL') NOT NULL DEFAULT 'ADMIN_REPORTES',
  `estado` enum('ACTIVO','INACTIVO','BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `password_hash`, `perfil`, `estado`, `ultimo_acceso`, `created_at`, `updated_at`) VALUES
(1, 'ADMIN', '$2b$12$LJgXleHcKRS9trfdAPuGWuAt6BuwR4Q0MhQ/HZ.C.1HoVnqHNxWUe', '', 'ACTIVO', '2026-08-01 22:00:38', '2026-08-01 20:20:27', '2026-08-01 22:00:38');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_asistencia_participante_fecha` (`participante_id`,`fecha`),
  ADD KEY `idx_asistencias_fecha` (`fecha`),
  ADD KEY `idx_asistencias_estado` (`estado`),
  ADD KEY `fk_asistencias_personal` (`personal_id`);

--
-- Indices de la tabla `canjes_colaborador`
--
ALTER TABLE `canjes_colaborador`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_canje_codigo` (`codigo_colaborador_id`),
  ADD KEY `idx_canjes_puesto_fecha` (`puesto_id`,`fecha`),
  ADD KEY `idx_canjes_colaborador_fecha` (`colaborador_id`,`fecha`);

--
-- Indices de la tabla `cargos`
--
ALTER TABLE `cargos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_cargos_nombre` (`nombre`),
  ADD KEY `idx_cargos_estado` (`estado`);

--
-- Indices de la tabla `codigos_colaborador`
--
ALTER TABLE `codigos_colaborador`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_codigo_colaborador_codigo` (`codigo`),
  ADD UNIQUE KEY `uk_codigo_colaborador_fecha` (`colaborador_id`,`fecha`),
  ADD KEY `idx_codigos_estado_fecha` (`estado`,`fecha`);

--
-- Indices de la tabla `colaboradores`
--
ALTER TABLE `colaboradores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_colaborador_celular` (`celular`),
  ADD KEY `idx_colaborador_estado` (`estado`);

--
-- Indices de la tabla `confirmaciones_participante`
--
ALTER TABLE `confirmaciones_participante`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_confirmaciones_participante_fecha` (`participante_id`,`fecha_hora`);

--
-- Indices de la tabla `consumos_participantes`
--
ALTER TABLE `consumos_participantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_consumo_participante_fecha_tipo` (`participante_id`,`fecha`,`tipo_alimento`),
  ADD KEY `idx_consumos_fecha_tipo` (`fecha`,`tipo_alimento`),
  ADD KEY `idx_consumos_estado` (`estado`),
  ADD KEY `fk_consumo_asistencia` (`asistencia_id`),
  ADD KEY `fk_consumos_personal` (`personal_id`);

--
-- Indices de la tabla `movimientos_puesto`
--
ALTER TABLE `movimientos_puesto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_movimientos_puesto_fecha` (`puesto_id`,`fecha_hora`),
  ADD KEY `idx_movimientos_canje` (`canje_id`);

--
-- Indices de la tabla `participantes`
--
ALTER TABLE `participantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_participantes_dni` (`dni`),
  ADD KEY `idx_participantes_region` (`region_id`),
  ADD KEY `idx_participantes_iglesia` (`iglesia_id`),
  ADD KEY `idx_participantes_cargo` (`cargo_id`),
  ADD KEY `idx_participantes_estado` (`estado`);

--
-- Indices de la tabla `personal_operativo`
--
ALTER TABLE `personal_operativo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_personal_operativo_celular` (`celular`),
  ADD KEY `idx_personal_operativo_funcion` (`funcion`),
  ADD KEY `idx_personal_operativo_estado` (`estado`);

--
-- Indices de la tabla `puestos_comida`
--
ALTER TABLE `puestos_comida`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_puesto_numero` (`numero_puesto`),
  ADD KEY `idx_puesto_estado_disponibilidad` (`estado`,`platos_disponibles`);

--
-- Indices de la tabla `regiones`
--
ALTER TABLE `regiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_regiones_nombre` (`nombre`),
  ADD KEY `idx_regiones_estado` (`estado`);

--
-- Indices de la tabla `regiones_eclesiales`
--
ALTER TABLE `regiones_eclesiales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_region_eclesial_nombre` (`nombre`),
  ADD UNIQUE KEY `uk_region_eclesial_codigo` (`codigo`),
  ADD KEY `idx_region_eclesial_region` (`region_id`),
  ADD KEY `idx_region_eclesial_estado` (`estado`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_usuario_nombre` (`usuario`),
  ADD KEY `idx_usuario_estado_perfil` (`estado`,`perfil`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `canjes_colaborador`
--
ALTER TABLE `canjes_colaborador`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cargos`
--
ALTER TABLE `cargos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `codigos_colaborador`
--
ALTER TABLE `codigos_colaborador`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `colaboradores`
--
ALTER TABLE `colaboradores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `confirmaciones_participante`
--
ALTER TABLE `confirmaciones_participante`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consumos_participantes`
--
ALTER TABLE `consumos_participantes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `movimientos_puesto`
--
ALTER TABLE `movimientos_puesto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `participantes`
--
ALTER TABLE `participantes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `personal_operativo`
--
ALTER TABLE `personal_operativo`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `puestos_comida`
--
ALTER TABLE `puestos_comida`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `regiones`
--
ALTER TABLE `regiones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `regiones_eclesiales`
--
ALTER TABLE `regiones_eclesiales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `fk_asistencia_participante` FOREIGN KEY (`participante_id`) REFERENCES `participantes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asistencias_personal` FOREIGN KEY (`personal_id`) REFERENCES `personal_operativo` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `canjes_colaborador`
--
ALTER TABLE `canjes_colaborador`
  ADD CONSTRAINT `fk_canje_codigo` FOREIGN KEY (`codigo_colaborador_id`) REFERENCES `codigos_colaborador` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_canje_colaborador` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_canje_puesto` FOREIGN KEY (`puesto_id`) REFERENCES `puestos_comida` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `codigos_colaborador`
--
ALTER TABLE `codigos_colaborador`
  ADD CONSTRAINT `fk_codigo_colaborador` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `confirmaciones_participante`
--
ALTER TABLE `confirmaciones_participante`
  ADD CONSTRAINT `fk_confirmacion_participante` FOREIGN KEY (`participante_id`) REFERENCES `participantes` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `consumos_participantes`
--
ALTER TABLE `consumos_participantes`
  ADD CONSTRAINT `fk_consumo_asistencia` FOREIGN KEY (`asistencia_id`) REFERENCES `asistencias` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_consumo_participante` FOREIGN KEY (`participante_id`) REFERENCES `participantes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_consumos_personal` FOREIGN KEY (`personal_id`) REFERENCES `personal_operativo` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimientos_puesto`
--
ALTER TABLE `movimientos_puesto`
  ADD CONSTRAINT `fk_movimiento_canje` FOREIGN KEY (`canje_id`) REFERENCES `canjes_colaborador` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimiento_puesto` FOREIGN KEY (`puesto_id`) REFERENCES `puestos_comida` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `participantes`
--
ALTER TABLE `participantes`
  ADD CONSTRAINT `fk_participante_cargo` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_participante_region` FOREIGN KEY (`region_id`) REFERENCES `regiones` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_participante_region_eclesiastica` FOREIGN KEY (`iglesia_id`) REFERENCES `regiones_eclesiales` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `regiones_eclesiales`
--
ALTER TABLE `regiones_eclesiales`
  ADD CONSTRAINT `fk_region_eclesial_region` FOREIGN KEY (`region_id`) REFERENCES `regiones` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
