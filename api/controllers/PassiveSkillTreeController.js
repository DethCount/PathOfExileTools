/**
 * PassiveSkillTreeController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {


    /**
     * Action blueprints:
     *    `/passiveskilltree/index`
     *    `/passiveskilltree`
     */
    index: function (req, res) {
        var http = require('http');

        var data = null,
            error = null;

        var options = {
            host: 'www.pathofexile.com',
            port: 80,
            path: '/passive-skill-tree',
            method: 'GET'
        };

        http
            .request(options, function(response) {
                console.log('response !!');

                var data = '';
                response
                    .on('data', function(chunk){
                        data += chunk;
                    })
                    .on('end', function() {
                        var regex = /passiveSkillTreeData\s=\s(.*),\s/gi,
                            matches = regex.exec(data),
                            nodes = matches ? JSON.parse(matches[1]).nodes : null,
                            realData = {};

                        for (nodeId in nodes) {
                            var node = nodes[nodeId];
                            for (skillIdx in node.sd) {
                                var skill = node.sd[skillIdx],
                                    regexSkillType = /([0-9]+)/gi,
                                    skillType = skill.replace(regexSkillType, 'X'),
                                    skillExec = regexSkillType.exec(skill),
                                    skillValue = skillExec ? skillExec[1] : 'No value';

                                if (!realData[skillType]) {
                                    realData[skillType] = {};
                                }

                                if (skillValue !== null) {
                                    if (!realData[skillType][skillValue]) {
                                        realData[skillType][skillValue] = {
                                            count : 1,
                                            nodes : {}
                                        }
                                    } else {
                                        realData[skillType][skillValue]['count']++;
                                    }
                                    realData[skillType][skillValue]['nodes'][node.id] = {
                                        id : node.id,
                                        name : node.dn,
                                        text: node.sd,
                                        icon: node.icon,
                                        isKeyStone: node.ks,
                                        isNotable: node.not,
                                        originalData: node
                                    };
                                }
                            }
                        }

                        res.json({
                            'data': realData
                        });
                    });
            })
            .on('error', function(e){
                res.json({
                    'error': e.message
                });
            })
            .end()
        ;

        console.log('end');
    },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to PassiveSkillTreeController)
   */
  _config: {}


};
