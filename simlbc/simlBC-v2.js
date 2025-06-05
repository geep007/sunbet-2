function SimlBedeClient(e) {
  let t = 'REQUESTED',
    n = 'VERIFIED',
    i = 'NOT_REQUESTED';
  var r = this;
  function s(e) {
    return e - new Date().getTime();
  }
  function o(e, t) {
    let n = new Date();
    var i = new Date();
    i.setTime(n.getTime() + 1e3 * t);
    var r = { pinState: e, expiresAtMillis: i.getTime() },
      s = btoa(JSON.stringify(r));
    localStorage.siml_sessPin_status = s;
  }
  function a(e) {
    var t = '';
    for (var n in e)
      if (e.hasOwnProperty(n)) {
        var i = e[n];
        if (Array.isArray(i))
          for (var r in ((n += '[]'), i)) {
            var s = i[r];
            t.length > 0 && (t += '&'), (t += encodeURI(n + '=' + s));
          }
        else t.length > 0 && (t += '&'), (t += encodeURI(n + '=' + i));
      }
    return t;
  }
  function c() {
    try {
      sessionStorage.siml_sunbet_profile &&
        sessionStorage.removeItem('siml_sunbet_profile');
    } catch (e) {
      log.warn('Error clearing profile');
    }
    return null;
  }
  function u() {
    var e = { auth: '', expiresAtMillis: '' },
      t = localStorage.siml_sunbet_bede;
    return t && (e = JSON.parse(atob(t))), e;
  }
  function l() {
    var e = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (t) {
        var n = (e + 16 * Math.random()) % 16 | 0;
        return (
          (e = Math.floor(e / 16)), ('x' === t ? n : (3 & n) | 8).toString(16)
        );
      }
    );
  }
  function f(e) {
    return JSON.parse(
      atob(e.split('.')[1].replace('-', '+').replace('_', '/'))
    );
  }
  function d(e) {
    var t = void 0;
    return {
      errors: [
        {
          code: 'bad-request',
          detail: 'Bad Request.',
          status: '400',
          title: 'Bad Request',
          meta: {
            correlationId: (t = e || -1),
            serviceId: 'SIMLBedeClientAPI',
          },
        },
      ],
    };
  }
  function g(e) {
    var t = void 0;
    return {
      errors: [
        {
          code: 'not-found',
          detail: 'Resource not found.',
          status: '404',
          title: 'Not Found',
          meta: {
            correlationId: (t = e || -1),
            serviceId: 'SIMLBedeClientAPI',
          },
        },
      ],
    };
  }
  function p(e) {
    var t = void 0;
    return {
      errors: [
        {
          code: 'not-authorized',
          detail:
            'Not authorized. Obtain appropriate security token and retry.',
          status: '401',
          title: 'Not Authorized',
          meta: {
            correlationId: (t = e || -1),
            serviceId: 'SIMLBedeClientAPI',
          },
        },
      ],
    };
  }
  function h(e) {
    var t = void 0;
    return {
      errors: [
        {
          code: 'service-unavialable',
          detail: 'Bede service unavailable',
          status: '503',
          title: 'Service Unavailable',
          meta: {
            correlationId: (t = e || -1),
            serviceId: 'SIMLBedeClientAPI',
          },
        },
      ],
    };
  }
  function v(e) {
    var t = void 0;
    return {
      errors: [
        {
          code: 'server-error',
          detail: 'Unexpected System Error',
          status: '500',
          title: 'Internal ServiceError',
          meta: {
            correlationId: (t = e || -1),
            serviceId: 'SIMLBedeClientAPI',
          },
        },
      ],
    };
  }
  function y(e, t) {
    var n = e.status,
      i = e.statusText,
      r = e.statusText;
    return (
      e.responseText && (r = e.responseText),
      {
        errors: [
          {
            code: 'unknown-error',
            detail: r,
            status: n,
            title: i,
            meta: { correlationId: t, serviceId: 'SIMLBedeClientAPI' },
          },
        ],
      }
    );
  }
  function b(e, t, n, i, r, s, o) {
    var a = void 0;
    try {
      var c = void 0;
      if (((a = l()), s)) {
        var d = u();
        if (0 == d.auth.trim().length) return o(p(a));
        f(d.auth), (c = 'Bearer ' + d.auth);
      }
      var g = void 0;
      i && i.trim().length > 0 && (g = i);
      var h = 'application/json';
      r && (h = 'application/x-www-form-urlencoded');
      var b = new XMLHttpRequest();
      b.open(t, n),
        'GET' !== t && b.setRequestHeader('Content-Type', h),
        b.setRequestHeader('Accept', 'application/json'),
        b.setRequestHeader('X-Site-Code', e),
        b.setRequestHeader('X-Correlation-Token', a),
        s && b.setRequestHeader('Authorization', c),
        (b.onload = function () {
          if (
            200 === b.status ||
            201 === b.status ||
            202 === b.status ||
            204 === b.status
          )
            o(null, b.responseText);
          else
            try {
              var e = void 0;
              (e = JSON.parse(b.responseText)), o(e);
            } catch (t) {
              o(y(b, a));
            }
        }),
        (b.onerror = function (e) {
          (e.status = '500'),
            (e.title = 'Error'),
            (e.detail = 'Internal Server Error. Please try again later.'),
            o({ errors: [e] });
        }),
        g ? b.send(g) : b.send();
    } catch (m) {
      o(v(a));
    }
  }
  function m(e, t, n, i) {
    var r = void 0;
    try {
      var s = void 0;
      if (((r = l()), n)) {
        var o = u();
        if (0 == o.auth.trim().length) return i(p(r));
        f(o.auth), (s = 'Bearer ' + o.auth);
      }
      var a = new XMLHttpRequest();
      a.open('HEAD', t),
        a.setRequestHeader('Accept', 'application/json'),
        a.setRequestHeader('X-Site-Code', e),
        a.setRequestHeader('X-Correlation-Token', r),
        n && a.setRequestHeader('Authorization', s),
        (a.onload = function () {
          if (200 === a.status || 201 === a.status || 204 === a.status) {
            var e = (function e(t) {
              var n = {},
                i = t.getAllResponseHeaders().toLowerCase().split('\n'),
                r = 0;
              for (r = 0; r < i.length; r++) {
                var s = i[r],
                  o = s.substring(0, s.indexOf(':'));
                o && !n[o] && (n[o] = t.getResponseHeader(o));
              }
              return n;
            })(a);
            return (e.body = a.responseText), i(null, e);
          }
          try {
            var t = void 0;
            return (t = JSON.parse(a.responseText)), i(t);
          } catch (n) {
            i(y(a, r));
          }
        }),
        (a.onerror = function (e) {
          (e.status = '500'),
            (e.title = 'Error'),
            (e.detail = 'Internal Server Error. Please try again later.'),
            i({ errors: [e] });
        }),
        a.send();
    } catch (c) {
      i(v(r));
    }
  }
  return (
    console,
    (this.constants = { PIN_REQSTED: t, PIN_VERIFIED: n, PIN_NOT_REQSTED: i }),
    (this.config = e),
    (this.setTokensLocalStorage = function () {
      localStorage.setItem('token', this.getGameCredentials().gameToken),
        localStorage.setItem('playerID', this.getGameCredentials().playerId);
    }),
    (this.setLoginStart = function () {
      var e = { timestamp: new Date().getTime() };
      localStorage.setItem('loginStart', JSON.stringify(e));
    }),
    (this.isLoggedIn = function () {
      try {
        return r.expiresInMillis() > 0;
      } catch (e) {
        return !1;
      }
    }),
    (this.getGameCredentials = function () {
      try {
        var e = u();
        if (0 == e.auth.trim().length) return { playerId: '', gameToken: '' };
        var t = f(e.auth);
        return {
          playerId: t.sub,
          gameToken: t.gameToken,
          password_expiry: t.password_expiry,
        };
      } catch (n) {
        return { playerId: '', gameToken: '' };
      }
    }),
    (this.expiresInMillis = function () {
      try {
        var e = u();
        if (0 == e.auth.trim().length) return -99.99;
        return s(e.expiresAtMillis);
      } catch (t) {
        return -99.99;
      }
    }),
    (this.forgotUsername = function (e, t) {
      if (r.isLoggedIn()) return t(d(l()));
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/forgotusername',
        JSON.stringify({ email: e }),
        !1,
        !1,
        function (e, n) {
          if (e) return t(e);
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.forgotPassword = function (e, t) {
      if (r.isLoggedIn()) return t(d(l()));
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/forgotpassword',
        JSON.stringify({ username: e }),
        !1,
        !1,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.resetForgotPassword = function (e, t) {
      if (r.isLoggedIn()) return t(d(l()));
      var n = void 0;
      e.token && ((n = decodeURIComponent(e.token)), (e.token = n));
      var i,
        s = r.config.bede_site_code;
      b(
        s,
        'PUT',
        r.config.session_path + '/updatepassword',
        JSON.stringify(e),
        !1,
        !1,
        function (e, t) {
          if (e) {
            t(e);
            return;
          }
          t(null, null);
        }
      );
    }),
    (this.checkResetForgotPasswordToken = function (e, t, n) {
      if (r.isLoggedIn()) return n(d(l()));
      var i,
        s = r.config.bede_player_path + '/players/identities/' + t + '/tokens',
        o = r.config.bede_site_code;
      b(
        o,
        'PATCH',
        s,
        JSON.stringify({ purpose: 'resetPassword', token: e }),
        !1,
        !1,
        function (e, t) {
          if (e) {
            n(e);
            return;
          }
          t ? n(null, JSON.parse(t)) : n(null, '');
        }
      );
    }),
    (this.login = function (e, t, n) {
      var i,
        s = r.config.bede_site_code;
      b(
        s,
        'POST',
        r.config.session_path + '/login',
        JSON.stringify({ username: e, password: t }),
        !1,
        !1,
        function (e, t) {
          if (e) {
            n(e);
            return;
          }
          var i = JSON.parse(t);
          r.storeSIMLState(i.access_token, i.expires_in),
            n(null, f(i.access_token).sub);
        }
      );
    }),
    (this.register = function (e, t) {
      var n = r.config.bede_site_code,
        i = r.config.session_path + '/minimalregister';
      e.currencyCode || (e.currencyCode = 'ZAR'),
        b(n, 'POST', i, JSON.stringify(e), !1, !1, function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        });
    }),
    (this.OTPRegister = function(username, pin, cb) {
      var siteCode = r.config.bede_site_code;
      var uri = r.config.session_path + "/completeregister";
      var reqBody = JSON.stringify({ username: username, pin: pin });
      b(siteCode, 'POST', uri, reqBody, false, false, function(err, data) {
        if (err) {
          return cb(err);
        }
        var result = JSON.parse(data);
        return cb(null, result);
      });
    }),
    (this.updateProfile = function (e, t) {
      r.getSessionPinStatus().pinState;
      var n = r.config.bede_site_code,
        i = r.config.session_path + '/updateProfile',
        s = e.siteData;
      s && delete e.siteData;
      var o = JSON.stringify(e),
        a = r.getGameCredentials();
      c(),
        b(n, 'POST', i, o, !1, !0, function (e, n) {
          if (e) {
            t(e);
            return;
          }
          var i = { playerId: a.playerId };
          s ? r.updateAccountData(s, t) : t(null, i);
        });
    }),
    (this.updateAccountData = function (e, t) {
      var n = r.config.bede_site_code,
        i = r.config.session_path + '/updateaccountdata',
        s = JSON.stringify(e),
        o = r.getGameCredentials();
      c(),
        b(n, 'POST', i, s, !1, !0, function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, { playerId: o.playerId });
        });
    }),
    (this.getAccountData = function (e) {
      var t,
        n = r.config.bede_site_code;
      b(
        n,
        'POST',
        r.config.session_path + '/accountdata',
        '',
        !1,
        !0,
        function (t, n) {
          if (t) return e(t);
          e(null, n);
        }
      );
    }),
    (this.userExistsURL = function (e) {
      var t = l(),
        n = e;
      (n.sitecode = r.config.bede_site_code), (n.correlation_id = t);
      var i = a(n);
      return r.config.session_path + '/isuniqueuser?' + i;
    }),
    (this.userExists = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/isuniqueuser',
        JSON.stringify(e),
        !1,
        !1,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.refreshSession = function (e) {
      var t = r.config.bede_site_code,
        n = r.config.session_path + '/refresh';
      c(),
        b(t, 'POST', n, '', !0, !0, function (t, n) {
          if (t) {
            e(t);
            return;
          }
          var i = JSON.parse(n);
          r.storeSIMLState(i.access_token, i.expires_in),
            e(null, f(i.access_token).sub);
        });
    }),
    (this.getSessionPinStatus = function () {
      var e = { pinState: i, expiresAtMillis: -99 },
        t = e,
        n = localStorage.siml_sessPin_status;
      return n
        ? 1 > s((t = JSON.parse(atob(n))).expiresAtMillis) || !r.isLoggedIn()
          ? e
          : t
        : e;
    }),
    (this.requestSessionPin = function (e, n, s) {
      var a,
        c = r.config.bede_site_code;
      b(
        c,
        'POST',
        r.config.session_path + '/reqSessPin',
        JSON.stringify({ verify_ttl_secs: e, channel: n }),
        !1,
        !0,
        function (n, r) {
          if (n) {
            o(i, -99), s(n);
            return;
          }
          var a = JSON.parse(r);
          !0 == a.sent && o(t, e), s(null, a);
        }
      );
    }),
    (this.verifySessionPin = function (e, t, i) {
      var s,
        a = r.config.bede_site_code;
      b(
        a,
        'POST',
        r.config.session_path + '/verifySessPin',
        JSON.stringify({ valid_ttl_secs: e, pin: t }),
        !1,
        !0,
        function (t, r) {
          if (t) {
            i(t);
            return;
          }
          var s = JSON.parse(r);
          !0 == s.valid && o(n, e), i(null, s);
        }
      );
    }),
    (this.getPaymentKey = function (e, t) {
      this.refreshSession(function (n, i) {
        if (n) return t(n);
        var s,
          o = r.config.bede_site_code;
        b(
          o,
          'POST',
          r.config.session_path + '/paymentkey',
          a({ amount: e }),
          !0,
          !0,
          function (e, n) {
            if (e) {
              t(e);
              return;
            }
            t(null, JSON.parse(n));
          }
        );
      });
    }),
    (this.getAppPaymentKey = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/paymentkey',
        a({ amount: e }),
        !0,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.getTokenPaymentKey = function (e, t, n) {
      this.refreshSession(function (i, s) {
        if (i) return n(i);
        var o,
          c = r.config.bede_site_code;
        b(
          c,
          'POST',
          r.config.session_path + '/paymentkey',
          a({ amount: e, payment_entity_id: t }),
          !0,
          !0,
          function (e, t) {
            if (e) {
              n(e);
              return;
            }
            n(null, JSON.parse(t));
          }
        );
      });
    }),
    (this.getPaymentEntities = function (e) {
      var t;
      b(
        r.config.bede_site_code,
        'POST',
        r.config.session_path + '/paymententities',
        '',
        !1,
        !0,
        function (t, n) {
          if (t) {
            e(t);
            return;
          }
          e(null, JSON.parse(n));
        }
      );
    }),
    (this.listDeposits = function (e, t) {
      t || 'function' != typeof e || ((t = e), (e = null));
      var n = e;
      n || (n = {}), (n.type = 'Deposit');
      var i = r.config.bede_site_code,
        s = JSON.stringify(n);
      b(
        i,
        'POST',
        r.config.session_path + '/listdeposits',
        s,
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.removePaymentEntity = function (e, t, n) {
      r.getSessionPinStatus().pinState;
      var i = r.config.bede_site_code,
        s = JSON.stringify({ payment_entity_id: e, reason: t });
      b(
        i,
        'DELETE',
        r.config.session_path + '/deletewithdrawalentity',
        s,
        !1,
        !0,
        function (e, t) {
          if (e) {
            n(e);
            return;
          }
          n(null, JSON.parse(t));
        }
      );
    }),
    (this.registerWithdrawalEntity = function (e, t) {
      r.getSessionPinStatus().pinState;
      var n = r.config.bede_site_code,
        i = JSON.stringify(e);
      b(
        n,
        'POST',
        r.config.session_path + '/createwithdrawalentity',
        i,
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.listWithdrawals = function (e, t) {
      t || 'function' != typeof e || ((t = e), (e = null));
      var n = e;
      n || (n = {}), (n.type = 'Withdrawal');
      var i = r.config.bede_site_code,
        s = JSON.stringify(n);
      b(
        i,
        'POST',
        r.config.session_path + '/listwithdrawals',
        s,
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.requestWithdrawal = function (e, t) {
      var n = r.config.bede_site_code,
        i = r.config.session_path + '/withdraw';
      e.currency_code || (e.currency_code = 'ZAR'),
        b(n, 'POST', i, a(e), !0, !0, function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        });
    }),
    (this.cancelPendingWithdrawal = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/reversewithdrawal',
        JSON.stringify({ transaction_id: e }),
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.logout = function (e) {
      var t = r.config.bede_site_code,
        n = r.config.bede_player_path + '/players/sessions';
      c(),
        r.isLoggedIn()
          ? b(t, 'DELETE', n, '', !1, !0, function (t, n) {
              if ((r.storeSIMLState('', -100), o(i, -99), t)) {
                e(t);
                return;
              }
              e(null, '');
            })
          : (r.storeSIMLState('', -100), o(i, -99));
    }),
    (this.changePassword = function (e, t, n) {
      r.getSessionPinStatus().pinState;
      var i,
        s = r.config.bede_site_code;
      b(
        s,
        'POST',
        r.config.session_path + '/changepassword',
        JSON.stringify({ old_password: e, new_password: t }),
        !1,
        !0,
        function (e, t) {
          if (e) return n(e);
          n(null, '');
        }
      );
    }),
    (this.getWallet = function (e) {
      var t,
        n = r.config.bede_site_code,
        i = r.getGameCredentials().playerId;
      b(
        n,
        'GET',
        r.config.bede_player_path + '/players/' + i + '/wallets',
        '',
        !1,
        !0,
        function (t, n) {
          if (t) {
            e(t);
            return;
          }
          e(null, JSON.parse(n));
        }
      );
    }),
    (this.getWalletTrxCount = function (e, t) {
      var n = a(e),
        i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId,
        o = r.config.bede_player_path + '/players/' + s + '/activities';
      n && (o = o + '?' + n),
        m(i, o, !0, function (e, n) {
          if (e) return t(e);
          var i = 0,
            r = 0,
            s = 0;
          return (
            n['x-items-per-page'] && (r = n['x-items-per-page']),
            n['x-total-items'] && (i = n['x-total-items']),
            n['x-total-pages'] && (s = n['x-total-pages']),
            t(null, { itemsPerPage: r, totalItems: i, totalPages: s })
          );
        });
    }),
    (this.getWalletTrxs = function (e, t) {
      var n = r.config.bede_site_code,
        i = a(e),
        s = r.getGameCredentials().playerId,
        o = r.config.bede_player_path + '/players/' + s + '/activities',
        o = o + '?' + i;
      b(n, 'GET', o, '', !1, !0, function (e, n) {
        if (e) {
          t(e);
          return;
        }
        t(null, JSON.parse(n));
      });
    }),
    (this.getBalances = function (e) {
      var t,
        n = r.config.bede_site_code,
        i = r.getGameCredentials().playerId;
      b(
        n,
        'GET',
        r.config.bede_player_path + '/players/' + i + '/balances',
        '',
        !1,
        !0,
        function (t, n) {
          if (t) {
            e(t);
            return;
          }
          e(null, JSON.parse(n));
        }
      );
    }),
    (this.getLimits = function (e) {
      var t,
        n = r.config.bede_site_code,
        i = r.getGameCredentials().playerId;
      b(
        n,
        'GET',
        r.config.bede_player_path + '/players/' + i + '/limits',
        '',
        !1,
        !0,
        function (t, n) {
          if (t) {
            e(t);
            return;
          }
          e(null, JSON.parse(n));
        }
      );
    }),
    (this.setLimits = function (e, t) {
      var n,
        i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId;
      b(
        i,
        'PATCH',
        r.config.bede_player_path + '/players/' + s + '/limits',
        JSON.stringify(e),
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, '');
        }
      );
    }),
    (this.setPendingLimits = function (e, t) {
      var n,
        i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId;
      b(
        i,
        'PUT',
        r.config.bede_player_path + '/players/' + s + '/pendinglimits',
        JSON.stringify(e),
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, '');
        }
      );
    }),
    (this.getProfile = function (e) {
      var t = (function e(t) {
        if (!t.config.cache_profile || !t.isLoggedIn()) return c();
        var n = sessionStorage.siml_sunbet_profile;
        return n ? JSON.parse(atob(n)) : null;
      })(r);
      t && e(null, t);
      var n,
        i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId;
      b(
        i,
        'GET',
        r.config.bede_player_path + '/players/' + s + '/profile',
        '',
        !1,
        !0,
        function (t, n) {
          if (t) {
            e(t);
            return;
          }
          var i = JSON.parse(n);
          (function e(t, n) {
            try {
              if (!t.config.cache_profile || !t.isLoggedIn() || !n) return c();
              var i = btoa(JSON.stringify(n));
              sessionStorage.siml_sunbet_profile = i;
            } catch (r) {
              log.warn('Error cacheing profile');
            }
          })(r, i),
            e(null, i);
        }
      );
    }),
    (this.checkSunMVGProfile = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/verifymvg',
        JSON.stringify(e),
        !1,
        !1,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.getMessageCounts = function (e, t) {
      var n = a(e),
        i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId,
        o = r.config.bede_player_path + '/players/' + s + '/messages';
      n && (o = o + '?' + n),
        m(i, o, !0, function (e, n) {
          if (e) return t(e);
          var i = 0,
            r = 0;
          return (
            n['x-total-count'] && (i = n['x-total-count']),
            n['x-total-unread-count'] && (r = n['x-total-unread-count']),
            t(null, { totalCount: i, totalUnreadCount: r })
          );
        });
    }),
    (this.listMessages = function (e, t) {
      var n = a(e),
        i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId,
        o = r.config.bede_player_path + '/players/' + s + '/messages';
      n && (o = o + '?' + n),
        b(i, 'GET', o, '', !1, !0, function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        });
    }),
    (this.getMessage = function (e, t) {
      var n = r.config.bede_site_code,
        i = r.getGameCredentials().playerId;
      b(
        n,
        'GET',
        r.config.bede_player_path + '/players/' + i + '/messages/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        }
      );
    }),
    (this.deleteMessage = function (e, t) {
      var n = r.config.bede_site_code,
        i = r.getGameCredentials().playerId;
      b(
        n,
        'DELETE',
        r.config.bede_player_path + '/players/' + i + '/messages/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, '');
        }
      );
    }),
    (this.getBonusCount = function (e, t) {
      var n = a(e),
        i = r.config.bede_site_code,
        s = r.config.bede_player_path + '/bonuses';
      n && (s = s + '?' + n),
        m(i, s, r.isLoggedIn(), function (e, n) {
          if (e) return t(e);
          var i = 0;
          return (
            n['x-total-count'] && (i = n['x-total-count']),
            t(null, { totalCount: i })
          );
        });
    }),
    (this.listBonuses = function (e, t) {
      var n = a(e),
        i = r.config.bede_site_code,
        s = r.config.bede_player_path + '/bonuses';
      n && (s = s + '?' + n),
        b(i, 'GET', s, '', !1, r.isLoggedIn(), function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        });
    }),
    (this.getBonus = function (e, t) {
      var n = r.config.bede_site_code,
        i = r.getGameCredentials().playerId,
        s =
          r.config.bede_player_path +
          '/players/' +
          i +
          '/bonuses/' +
          e.promoCode;
      if (e.depositAmount) {
        var o = a({ depositAmount: e.depositAmount });
        o && (s = s + '?' + o);
      }
      b(n, 'GET', s, '', !1, !0, function (e, n) {
        return e ? t(e) : t(null, JSON.parse(n));
      });
    }),
    (this.activateBonus = function (e, t) {
      var n = r.config.bede_site_code,
        i = r.getGameCredentials().playerId;
      b(
        n,
        'PUT',
        r.config.bede_player_path + '/players/' + i + '/bonuses/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, '');
        }
      );
    }),
    (this.deactivateAccount = function (e, t) {
      var n = JSON.stringify(e),
        i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId;
      b(
        i,
        'PUT',
        r.config.bede_player_path + '/players/' + s + '/accountstatus',
        n,
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, n);
        }
      );
    }),
    (this.cancelBonus = function (e, t) {
      var n;
      b(
        r.config.bede_site_code,
        'DELETE',
        r.config.bede_player_path + '/bonuses/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, '');
        }
      );
    }),
    (this.listBonusHistory = function (e, t) {
      var n = a(e),
        i = r.getGameCredentials().playerId,
        s = r.config.bede_player_path + '/players/' + i + '/bonuses',
        o = r.config.bede_site_code;
      n && (s = s + '?' + n),
        b(o, 'GET', s, '', !1, !0, function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        });
    }),
    (this.storeSIMLState = function (e, t) {
      let n = new Date();
      var i = new Date();
      i.setTime(n.getTime() + 1e3 * t);
      var r = { auth: e, expiresAtMillis: i.getTime() },
        s = btoa(JSON.stringify(r));
      localStorage.siml_sunbet_bede = s;
    }),
    (this.getGames = function (e, t, n) {
      var i = r.config.bede_site_code,
        s = null != e ? 'take=' + e : 'take=100';
      if (t) {
        var o = t.tag,
          a = '';
        if (Array.isArray(t.tag))
          for (let c = 0; c < t.tag.length; c++) a += '&tag[]=' + o[c];
        else a = '&tag[]=' + o;
        var u = r.config.bede_player_path + '/games?' + s + a;
      } else u = r.config.bede_player_path + '/games?' + s;
      b(
        i,
        'GET',
        u,
        JSON.stringify({
          currentPage: '1',
          itemsPerPage: '40',
          totalPages: '1',
          totalItems: '100',
        }),
        !1,
        !0,
        function (e, t) {
          if (e) {
            n(e);
            return;
          }
          n(null, JSON.parse(t));
        }
      );
    }),
    (this.getGame = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'GET',
        r.config.bede_player_path + '/games/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.launchGame = function (e, t, n) {
      var i = r.config.bede_site_code,
        s = r.getGameCredentials().playerId,
        o = r.config.bede_player_path + '/games/' + e + '/launch',
        a = {
          playerId: s,
          channel: 'desktop',
          language: 'EN',
          autoLaunch: !1,
          technology: 'flash',
          userAgent: window.navigator.userAgent,
          sourceUrl: i + '/en.games.html',
          sourceArea: 'divLeftMenu',
          includeAdditionalData: !1,
          currencyCode: 'ZAR',
        };
      t && (a.tableId = t),
        b(i, 'POST', o, JSON.stringify(a), !1, !0, function (e, t) {
          if (e) {
            n(e);
            return;
          }
          n(null, JSON.parse(t));
        });
    }),
    (this.availableBalance = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'GET',
        r.config.session_path + '/points/available/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, JSON.parse(n));
        }
      );
    }),
    (this.requestTransfer = function (e, t, n, i) {
      var s,
        o = r.config.bede_site_code;
      b(
        o,
        'POST',
        r.config.session_path + '/points/casino/transfer/' + e,
        JSON.stringify({ amount: t, bedewallet: n }),
        !1,
        !0,
        function (e, t) {
          if (e) {
            i(e);
            return;
          }
          i(null, JSON.parse(t));
        }
      );
    }),
    (this.authorizeTransfer = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/points/authtransfer',
        JSON.stringify({ pin: e }),
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, n);
        }
      );
    }),
    (this.confirmFicaPin = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/confirmMVGFicaPin ',
        JSON.stringify({ pin: e }),
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, n);
        }
      );
    }),
    (this.activateDepositBonus = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'PUT',
        r.config.session_path + '/activateBonusSegment/' + e,
        '',
        !1,
        !0,
        function (e) {
          if (e) {
            t(e);
            return;
          }
        }
      );
    }),
    (this.getSegment = function (e) {
      var t;
      b(
        r.config.bede_site_code,
        'GET',
        r.config.session_path + '/segments',
        '',
        !1,
        !0,
        function (t, n) {
          return t ? e(t) : e(null, JSON.parse(n));
        }
      );
    }),
    (this.optIn = function (e, t) {
      var n,
        i = JSON.stringify({ campaign: e });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.session_path + '/optInCampaign',
        i,
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, n);
        }
      );
    }),
    (this.optInBirthday = function (e) {
      var t,
        n = JSON.stringify({ campaign: 'birthday2023' });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.session_path + '/optInCampaign',
        n,
        !1,
        !0,
        function (t, n) {
          return t ? e(t) : e(null, n);
        }
      );
    }),
    (this.getLeaderboard = function (e, t) {
      var n;
      b(
        r.config.bede_site_code,
        'GET',
        r.config.session_path + '/leaderboard/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        }
      );
    }),
    (this.getnonMVGLeaderboard = function (e) {
      var t;
      b(
        r.config.bede_site_code,
        'GET',
        r.config.session_path + '/nonmvg/leaderboard/birthday2023',
        '',
        !1,
        !0,
        function (t, n) {
          return t ? e(t) : e(null, JSON.parse(n));
        }
      );
    }),
    (this.getnoMVGLeaderboard = function (e) {
      var t;
      b(
        r.config.bede_site_code,
        'GET',
        r.config.session_path + '/nonmvg/leaderboard/SunBetGolfChallenge2023',
        '',
        !1,
        !0,
        function (t, n) {
          return t ? e(t) : e(null, JSON.parse(n));
        }
      );
    }),
    (this.activatePromo = function (e, t) {
      var n;
      b(
        r.config.bede_site_code,
        'PUT',
        r.config.session_path + '/activatePromo/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, n);
        }
      );
    }),
    (this.kambiRewards = function (e) {
      var t;
      b(
        r.config.bede_site_code,
        'GET',
        r.config.session_path + '/kambi/player/rewards',
        '',
        !1,
        !0,
        function (t, n) {
          return t ? e(t) : e(null, JSON.parse(n));
        }
      );
    }),
    (this.generateCall = function (e, t, n, i) {
      var s,
        o = JSON.stringify({ amount: e, player: t, method: n });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.session_path + '/walletdoc/deposit/generate',
        o,
        !1,
        !0,
        function (e, t) {
          return e ? i(e) : i(null, JSON.parse(t));
        }
      );
    }),
    (this.statusCall = function (e, t, n, i) {
      var s,
        o = JSON.stringify({ amount: e, player: t, transactionId: n });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.session_path + '/walletdoc/deposit/status',
        o,
        !1,
        !0,
        function (e, t) {
          return e ? i(e) : i(null, JSON.parse(t));
        }
      );
    }),
    (this.ozowDeposit = function (e, t, n) {
      var i,
        s = JSON.stringify({ amount: e, player: t });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.ingress_session_path + '/ozow-node/deposit/create',
        s,
        !1,
        !0,
        function (e, t) {
          return e ? n(e) : n(null, JSON.parse(t));
        }
      );
    }),
    (this.ozowCheck = function (e, t, n) {
      var i,
        s = JSON.stringify({ transactionReference: e, player: t });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.ingress_session_path + '/ozow-node/deposit/check',
        s,
        !1,
        !0,
        function (e, t) {
          return e ? n(e) : n(null, JSON.parse(t));
        }
      );
    }),
    (this.ficaUpload = function (e, t, n) {
      var i = r.config.bede_site_code,
        s = r.config.session_path + '/uploadFicDocs?file=' + e;
      console.log('body', t),
        (function e(t, n, i, r, s, o, a) {
          var c = void 0;
          try {
            var d = void 0;
            if (((c = l()), o)) {
              var g = u();
              if (0 == g.auth.trim().length) return a(p(c));
              f(g.auth), (d = 'Bearer ' + g.auth);
            }
            var h = r,
              b = 'application/json';
            s && (b = 'multipart/form-data');
            var m = new XMLHttpRequest();
            m.open(n, i),
              m.setRequestHeader('Accept', 'application/json'),
              m.setRequestHeader('X-Site-Code', t),
              m.setRequestHeader('X-Correlation-Token', c),
              o && m.setRequestHeader('Authorization', d),
              (m.onload = function () {
                if (200 === m.status || 201 === m.status || 204 === m.status)
                  a(null, m.responseText);
                else
                  try {
                    var e = void 0;
                    (e = JSON.parse(m.responseText)), a(e);
                  } catch (t) {
                    a(y(m, c));
                  }
              }),
              (m.onerror = function (e) {
                (e.status = '500'),
                  (e.title = 'Error'),
                  (e.detail = 'Internal Server Error. Please try again later.'),
                  a({ errors: [e] });
              }),
              h ? m.send(h) : m.send();
          } catch (T) {
            a(v(c));
          }
        })(i, 'POST', s, t, !0, !0, n);
    }),
    (this.getHistory = function (e, t) {
      var n;
      b(
        r.config.bede_site_code,
        'GET',
        r.config.session_path + '/pragmatic/history?take=80&skip=' + e,
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        }
      );
    }),
    (this.getProviderDetails = function (e, t, n) {
      var i;
      b(
        r.config.bede_site_code,
        'GET',
        r.config.session_path +
          '/gameprovider/license?gameprovider=' +
          e +
          '&trxdate=' +
          t,
        '',
        !1,
        !0,
        function (e, t) {
          return e ? n(e) : n(null, JSON.parse(t));
        }
      );
    }),
    (this.sunbetManualClaim = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/sunslotskiosk/manualclaim/' + e,
        '',
        !1,
        !1,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, n), console.log('data', n);
        }
      );
    }),
    (this.sunbetClaim = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/sunslotskiosk/sunbetclaim/' + e,
        '',
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, n);
        }
      );
    }),
    (this.authSunbetClaim = function (e, t) {
      var n,
        i = r.config.bede_site_code;
      b(
        i,
        'POST',
        r.config.session_path + '/sunslotskiosk/authclaim',
        JSON.stringify({ pin: e }),
        !1,
        !0,
        function (e, n) {
          if (e) {
            t(e);
            return;
          }
          t(null, n);
        }
      );
    }),
    (this.sunLaunchGame = function (e, t) {
      var n;
      b(r.config.bede_site_code, 'GET', e, '', !1, !0, function (e, n) {
        return e ? t(e) : t(null, JSON.parse(n));
      });
    }),
    (this.scoutPlayerToken = function (e, t) {
      var n;
      b(
        r.config.bede_site_code,
        'POST',
        e + '/scoutPlayerToken',
        '',
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        }
      );
    }),
    (this.launchTopSpin = function (e, t, n) {
      var i;
      b(
        r.config.bede_site_code,
        'GET',
        e + '/launchurl/' + t,
        '',
        !1,
        this.isLoggedIn(),
        function (e, t) {
          return e ? n(e) : n(null, JSON.parse(t));
        }
      );
    }),
    (this.turfsportLobby = function (e) {
      var t = r.config.bede_site_code,
        n =
          r.config.sunbet_rt_baseurl +
          '/sessionToken',
        i = r.config.turfsport_server;
      b(t, 'GET', n, '', !1, !0, function (t, n) {
        if (t) return e(t);
        var r = JSON.parse(n);
        return (r.turfsport_url = i), e(null, r);
      });
    }),
    (this.ottCreate = function (e, t, n) {
      var i,
        s = JSON.stringify({ voucher: e, mobile: t });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.ingress_session_path + '/ott/voucher/create',
        s,
        !1,
        !0,
        function (e, t) {
          return e ? n(e) : n(null, JSON.parse(t));
        }
      );
    }),
    (this.ottCheck = function (e, t) {
      var n,
        i = JSON.stringify({ reference: e });
      b(
        r.config.bede_site_code,
        'POST',
        r.config.ingress_session_path + '/ott/voucher/check',
        i,
        !1,
        !0,
        function (e, n) {
          return e ? t(e) : t(null, JSON.parse(n));
        }
      );
    }),
    this
  );
}

(() => {
  let array = [];
  if (window.simlBC) array = simlBC;

  window.simlBC = SimlBedeClient(siml_bedeClientConfig);

  Object.assign(simlBC, {
    push: (...functions) => {
      functions.forEach(f => f());
    },
  });

  simlBC.push(...array);
})();
