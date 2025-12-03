# Introducción

Este trabajo de grado presenta el diseño, implementación y evaluación de un sitio web mínimo compuesto por un sistema de inicio de sesión (login) y un pequeño panel de control (dashboard) llamado Energo.

El objetivo principal es demostrar, de forma práctica y documentada, el proceso de endurecimiento de seguridad aplicado a una aplicación web desde un estado inicial (baseline) hasta un estado reforzado, y validar los resultados mediante pruebas de escaneo y análisis de vulnerabilidades.

Contexto y motivación:
- Las aplicaciones web manejan información sensible y son objetivo frecuente de ataques. Este proyecto ofrece un caso real y sencillo para aprender medidas prácticas de seguridad.

Descripción del sistema:
- Frontend: aplicación Vite/React que consume una API REST.
- Backend: servidor en Node.js con Express y MySQL. El servidor principal está en [`server/src/server.ts()`](server/src/server.ts:1).
- Cliente: el cliente HTTP utiliza Axios con credenciales en [`src/api/client.ts()`](src/api/client.ts:1).

Alcances del trabajo:
- Implementar un login funcional y un dashboard mínimo.
- Identificar y aplicar políticas de seguridad (gestión de secretos, hashing de contraseñas, sesiones, CORS, auditoría, etc.) documentadas en [`docs/entregable-politicas-seguridad.md()`](docs/entregable-politicas-seguridad.md:1).
- Desplegar la aplicación en una máquina Linux (Ubuntu o Kali) para realizar pruebas de penetración controladas.

Metodología:
1. Construcción del sistema básico (login + dashboard).
2. Análisis de riesgos y auditoría inicial (revisión de código y configuración).
3. Implementación de medidas de seguridad (CSRF, Helmet, cookies seguras, rate limiting, validación, TLS, etc.).
4. Evaluación con herramientas: Nmap, OWASP ZAP/BurpSuite, Metasploit y scanners de dependencias (CERA/Nexus).
5. Recolección de evidencias y elaboración del informe comparativo ANTES/DESPUÉS.

Resultados esperados:
- Un informe reproducible que muestre la reducción de vulnerabilidades tras las mitigaciones.
- Ejemplos prácticos de políticas de contraseñas, cifrado y logging, y comandos para su ejecución en Linux.

Estructura de la tesis:
- Capítulo 1: Introducción y estado del arte.
- Capítulo 2: Diseño del sistema y arquitectura.
- Capítulo 3: Implementación (código y configuración).
- Capítulo 4: Políticas de seguridad y endurecimiento (ver [`docs/politicas-de-seguridad.md()`](docs/politicas-de-seguridad.md:1)).
- Capítulo 5: Pruebas de vulnerabilidad, evidencias y resultados.
- Capítulo 6: Conclusiones y trabajo futuro.

Contribución:
- El proyecto proporciona un caso didáctico completo que integra desarrollo web, buenas prácticas de seguridad y técnicas de evaluación ofensiva controlada, apropiado para la actividad académica propuesta.