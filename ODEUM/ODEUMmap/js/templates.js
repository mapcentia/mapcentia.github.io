this["Templates"] = this["Templates"] || {};
this["Templates"]["body.tmpl"] = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<!-- map -->");_.b("\n" + i);_.b("<div id=\"pane\">");_.b("\n" + i);_.b("    <div id=\"container\">");_.b("\n" + i);_.b("        <div id=\"map\"></div>");_.b("\n" + i);_.b("        <div id=\"side-panel\">");_.b("\n" + i);_.b("            <div id=\"top\">");_.b("\n" + i);_.b("                <div id=\"buffer-container\">");_.b("\n" + i);_.b("                    <div class=\"form-inline\">");_.b("\n" + i);_.b("                        <button class=\"btn btn-warning\" id=\"done-btn\">Indsæt kort</button>");_.b("\n" + i);_.b("                        <button class=\"btn btn-info\" id=\"unselect-all-btn\">Fravælg alle lag</button>");_.b("\n" + i);_.b("                    </div>");_.b("\n" + i);_.b("                </div>");_.b("\n" + i);_.b("            </div>");_.b("\n" + i);_.b("            <div role=\"tabpanel\">");_.b("\n" + i);_.b("                <!-- Nav tabs -->");_.b("\n" + i);_.b("                <ul class=\"nav nav-tabs\" role=\"tablist\" id=\"main-tabs\">");_.b("\n" + i);_.b("                    <li role=\"presentation\" class=\"active\"><a href=\"#layer-content\" aria-controls=\"\" role=\"tab\"");_.b("\n" + i);_.b("                                               data-toggle=\"tab\">Lag</a></li>");_.b("\n" + i);_.b("                    <li role=\"presentation\"><a href=\"#legend-content\" aria-controls=\"\" role=\"tab\"");_.b("\n" + i);_.b("                                               data-toggle=\"tab\">Signatur</a></li>");_.b("\n" + i);_.b("\n" + i);_.b("                </ul>");_.b("\n" + i);_.b("\n" + i);_.b("                <!-- Tab panes -->");_.b("\n" + i);_.b("                <div class=\"tab-content\">");_.b("\n" + i);_.b("                    <div role=\"tabpanel\" class=\"tab-pane active\" id=\"layer-content\">");_.b("\n" + i);_.b("                        <div class=\"panel-group\" id=\"layers\" role=\"tablist\" aria-multiselectable=\"true\"></div>");_.b("\n" + i);_.b("                    </div>");_.b("\n" + i);_.b("                    <div role=\"tabpanel\" class=\"tab-pane\" id=\"legend-content\">");_.b("\n" + i);_.b("                        <div id=\"legend\"></div>");_.b("\n" + i);_.b("                    </div>");_.b("\n" + i);_.b("                </div>");_.b("\n" + i);_.b("            </div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <nav class=\"navbar navbar-default\" role=\"navigation\">");_.b("\n" + i);_.b("        <div class=\"container-fluid\">");_.b("\n" + i);_.b("            <div class=\"navbar-header\">");_.b("\n" + i);_.b("                <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\"");_.b("\n" + i);_.b("                        data-target=\"#bs-example-navbar-collapse-1\">");_.b("\n" + i);_.b("                    <span class=\"sr-only\">Toggle navigation</span>");_.b("\n" + i);_.b("                    <span class=\"icon-bar\"></span>");_.b("\n" + i);_.b("                    <span class=\"icon-bar\"></span>");_.b("\n" + i);_.b("                    <span class=\"icon-bar\"></span>");_.b("\n" + i);_.b("                </button>");_.b("\n" + i);_.b("            </div>");_.b("\n" + i);_.b("            <div class=\"collapse navbar-collapse\" id=\"bs-example-navbar-collapse-1\">");_.b("\n" + i);_.b("                <ul class=\"nav navbar-nav\" style=\"float: left\">");_.b("\n" + i);_.b("                    <li class=\"dropdown\">");_.b("\n" + i);_.b("                        <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">Baggrund <b");_.b("\n" + i);_.b("                                class=\"caret\"></b></a>");_.b("\n" + i);_.b("                        <ul class=\"dropdown-menu\" id=\"base-layer-list\">");_.b("\n" + i);_.b("                        </ul>");_.b("\n" + i);_.b("                    </li>");_.b("\n" + i);_.b("                </ul>");_.b("\n" + i);_.b("            </div>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("    </nav>");_.b("\n" + i);_.b("</div>");return _.fl();;});